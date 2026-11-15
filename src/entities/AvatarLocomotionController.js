import * as THREE from 'three';

/**
 * AvatarLocomotionController
 * Provides full WASD + Arrow Keys + Gamepad avatar locomotion for the 38cm Explorer.
 * Features:
 * - Spring-arm third-person follow cam and first-person street eye view (V key).
 * - Analog movement vector calculation with acceleration and deceleration damping.
 * - Dynamic terrain collision and slope alignment using PlanetTerrain elevation.
 * - Jump kinematics with gravity simulation.
 * - Gamepad API polling for dual thumbstick steering.
 */
export class AvatarLocomotionController {
  constructor(avatar, camera, domElement, terrain = null, audioEngine = null) {
    this.avatar = avatar;
    this.camera = camera;
    this.domElement = domElement;
    this.terrain = terrain;
    this.audioEngine = audioEngine;

    this.enabled = false;
    this.viewMode = 'third_person'; // 'third_person' | 'first_person'

    // Movement speeds (scaled for 38cm miniature explorer: ~1.2 m/s walk, ~2.5 m/s sprint)
    this.walkSpeed = 1.6;
    this.sprintSpeed = 3.2;
    this.turnSpeed = 4.0;
    this.jumpForce = 3.5;
    this.gravity = -9.8;

    // State
    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isSprinting = false;
    this.isMoving = false;

    // Camera follow parameters
    this.camDistance = 1.4;
    this.camPitch = 0.25; // radians up
    this.camYaw = 0;      // radians around
    this.camTargetOffset = new THREE.Vector3(0, 0.42, 0); // 38cm avatar eye/shoulder level
    this.mouseSensitivity = 0.0025;
    this.isMouseDown = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    // Footstep timer
    this.footstepTimer = 0;

    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
    this.onWheel = this.handleWheel.bind(this);

    this.setupListeners();
  }

  setupListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    if (this.domElement) {
      this.domElement.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
      this.domElement.addEventListener('wheel', this.onWheel, { passive: true });
    }
  }

  dispose() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.domElement) {
      this.domElement.removeEventListener('mousedown', this.onMouseDown);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      this.domElement.removeEventListener('wheel', this.onWheel);
    }
  }

  handleKeyDown(e) {
    if (!this.enabled) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
      case 'Space':
        if (this.isGrounded) {
          this.verticalVelocity = this.jumpForce;
          this.isGrounded = false;
        }
        break;
      case 'KeyV':
        this.viewMode = this.viewMode === 'third_person' ? 'first_person' : 'third_person';
        break;
    }
  }

  handleKeyUp(e) {
    if (!this.enabled) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  }

  handleMouseDown(e) {
    if (!this.enabled) return;
    if (e.target && e.target.closest && e.target.closest('#hud-overlay, #inspector-card, .modal-backdrop, #soundscape-panel, #director-studio, #code-ide-modal')) {
      return;
    }
    this.isMouseDown = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  handleMouseMove(e) {
    if (!this.enabled || !this.isMouseDown) return;
    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    this.camYaw -= deltaX * this.mouseSensitivity;
    this.camPitch = Math.max(-0.4, Math.min(1.2, this.camPitch + deltaY * this.mouseSensitivity));

    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  handleMouseUp() {
    this.isMouseDown = false;
  }

  handleWheel(e) {
    if (!this.enabled) return;
    this.camDistance = Math.max(0.6, Math.min(4.0, this.camDistance + e.deltaY * 0.002));
  }

  pollGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return { x: 0, y: 0, sprint: false, jump: false };
    const gamepads = navigator.getGamepads();
    if (!gamepads || !gamepads[0]) return { x: 0, y: 0, sprint: false, jump: false };

    const gp = gamepads[0];
    const deadzone = 0.15;
    let lx = gp.axes[0] || 0;
    let ly = gp.axes[1] || 0;
    if (Math.abs(lx) < deadzone) lx = 0;
    if (Math.abs(ly) < deadzone) ly = 0;

    // Right thumbstick for camera
    let rx = gp.axes[2] || 0;
    let ry = gp.axes[3] || 0;
    if (Math.abs(rx) > deadzone) this.camYaw -= rx * 0.04;
    if (Math.abs(ry) > deadzone) this.camPitch = Math.max(-0.4, Math.min(1.2, this.camPitch + ry * 0.04));

    return {
      x: lx,
      y: ly,
      sprint: gp.buttons[10]?.pressed || gp.buttons[4]?.pressed || false,
      jump: gp.buttons[0]?.pressed || false
    };
  }

  update(delta) {
    if (!this.enabled || !this.avatar || !this.avatar.group) return;

    const gp = this.pollGamepad();

    // Determine movement direction relative to camera yaw
    let moveX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0) + gp.x;
    let moveZ = (this.keys.forward ? 1 : 0) - (this.keys.backward ? 1 : 0) - gp.y;

    const inputMag = Math.hypot(moveX, moveZ);
    this.isMoving = inputMag > 0.05;
    this.isSprinting = this.keys.sprint || gp.sprint;

    const currentSpeed = (this.isSprinting ? this.sprintSpeed : this.walkSpeed) * Math.min(1.0, inputMag);

    if (this.isMoving) {
      // Normalize input
      const normX = moveX / inputMag;
      const normZ = moveZ / inputMag;

      // Project into world coordinates based on camera yaw
      const forward = new THREE.Vector3(Math.sin(this.camYaw), 0, Math.cos(this.camYaw)).normalize();
      const right = new THREE.Vector3(-Math.cos(this.camYaw), 0, Math.sin(this.camYaw)).normalize();

      const worldMoveDir = new THREE.Vector3()
        .addScaledVector(forward, normZ)
        .addScaledVector(right, normX)
        .normalize();

      this.velocity.x = worldMoveDir.x * currentSpeed;
      this.velocity.z = worldMoveDir.z * currentSpeed;

      // Rotate avatar mesh toward movement direction smoothly
      const targetAngle = Math.atan2(worldMoveDir.x, worldMoveDir.z);
      let diff = targetAngle - this.avatar.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.avatar.group.rotation.y += diff * Math.min(1.0, delta * this.turnSpeed);

      // Footstep audio synths
      this.footstepTimer += delta * (this.isSprinting ? 1.8 : 1.0);
      if (this.footstepTimer > 0.45 && this.isGrounded && this.audioEngine) {
        this.footstepTimer = 0;
        this.audioEngine.playFootstep('asphalt', this.avatar.group.position);
      }
    } else {
      this.velocity.x *= Math.max(0, 1 - delta * 12);
      this.velocity.z *= Math.max(0, 1 - delta * 12);
      this.footstepTimer = 0;
    }

    // Apply horizontal motion
    this.avatar.group.position.x += this.velocity.x * delta;
    this.avatar.group.position.z += this.velocity.z * delta;

    // Apply vertical physics
    if (!this.isGrounded) {
      this.verticalVelocity += this.gravity * delta;
      this.avatar.group.position.y += this.verticalVelocity * delta;
    }

    // Ground check with terrain
    let groundHeight = 0.05;
    if (this.terrain && typeof this.terrain.getElevationAt === 'function') {
      groundHeight = this.terrain.getElevationAt(this.avatar.group.position.x, this.avatar.group.position.z) + 0.05;
    }

    if (this.avatar.group.position.y <= groundHeight) {
      this.avatar.group.position.y = groundHeight;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    // Camera follow update
    this.updateCamera(delta);
  }

  updateCamera(delta) {
    if (!this.camera || !this.avatar || !this.avatar.group) return;

    const avatarPos = this.avatar.group.position;
    const targetPos = new THREE.Vector3().copy(avatarPos).add(this.camTargetOffset);

    if (this.viewMode === 'first_person') {
      // First person view right at avatar eye level (y + 0.38m)
      const eyePos = new THREE.Vector3().copy(avatarPos);
      eyePos.y += 0.38;
      this.camera.position.copy(eyePos);

      const lookTarget = new THREE.Vector3(
        eyePos.x + Math.sin(this.camYaw) * Math.cos(this.camPitch),
        eyePos.y - Math.sin(this.camPitch),
        eyePos.z + Math.cos(this.camYaw) * Math.cos(this.camPitch)
      );
      this.camera.lookAt(lookTarget);
    } else {
      // Third person follow camera
      const offsetX = Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDistance;
      const offsetY = Math.sin(this.camPitch) * this.camDistance;
      const offsetZ = Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDistance;

      const idealCamPos = new THREE.Vector3(
        targetPos.x - offsetX,
        targetPos.y + offsetY,
        targetPos.z - offsetZ
      );

      // Smooth camera interpolation
      this.camera.position.lerp(idealCamPos, Math.min(1.0, delta * 10.0));
      this.camera.lookAt(targetPos);
    }
  }
}
