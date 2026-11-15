import * as THREE from 'three';

/**
 * Autonomous Sky Traffic Engine (Major 3)
 * Simulates electric VTOL (vertical take-off & landing) passenger drones
 * navigating 3D elevated aerial corridors between Tech City, AI Valley, and Harbor.
 */
export class SkyTrafficEngine {
  constructor(scene) {
    this.scene = scene;
    this.vessels = [];
    this.flightCorridors = [];

    this.initCorridors();
    this.initVessels();
  }

  initCorridors() {
    // 3D Elevated Catmull-Rom flight corridor spanning Tech City (0, 55, 40), AI Valley (-240, 75, -80), Harbor (180, 50, 160)
    const pointsA = [
      new THREE.Vector3(0, 55, 40),
      new THREE.Vector3(-120, 70, -20),
      new THREE.Vector3(-240, 75, -80),
      new THREE.Vector3(-140, 65, 80),
      new THREE.Vector3(180, 50, 160),
      new THREE.Vector3(90, 58, 100),
      new THREE.Vector3(0, 55, 40)
    ];
    this.corridorA = new THREE.CatmullRomCurve3(pointsA, true, 'centripetal');
    this.flightCorridors.push(this.corridorA);
  }

  createDroneModel(colorHex = 0x38bdf8) {
    const droneGroup = new THREE.Group();

    // Fuselage: aerodynamic pod
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.9, 3.2, 12);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    droneGroup.add(bodyMesh);

    // Tinted Glass Canopy
    const canopyGeo = new THREE.SphereGeometry(0.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    canopyGeo.scale(0.8, 0.6, 1.4);
    canopyGeo.rotateX(-Math.PI / 2);
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1
    });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 0.45, 0.2);
    droneGroup.add(canopyMesh);

    // Dual Tilt-Rotor Wings
    const wingGeo = new THREE.BoxGeometry(4.8, 0.12, 0.5);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, 0.2, -0.4);
    droneGroup.add(wingMesh);

    // Spinning Rotor Blades (Left & Right)
    const rotorGeo = new THREE.BoxGeometry(1.4, 0.02, 0.14);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.75 });

    const rotorL = new THREE.Mesh(rotorGeo, rotorMat);
    rotorL.position.set(-2.4, 0.4, -0.4);
    droneGroup.add(rotorL);

    const rotorR = new THREE.Mesh(rotorGeo, rotorMat);
    rotorR.position.set(2.4, 0.4, -0.4);
    droneGroup.add(rotorR);

    // FAA Navigation & Anti-Collision Strobe Lights
    // Red (Port / Left), Green (Starboard / Right), Pulsing White (Top Beacon)
    const navGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const portLight = new THREE.Mesh(navGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    portLight.position.set(-2.45, 0.2, -0.4);
    droneGroup.add(portLight);

    const stbdLight = new THREE.Mesh(navGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    stbdLight.position.set(2.45, 0.2, -0.4);
    droneGroup.add(stbdLight);

    const strobeLight = new THREE.Mesh(navGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    strobeLight.position.set(0, 0.95, -0.2);
    droneGroup.add(strobeLight);

    // Miniature Scale: 1.8m virtual passenger drone
    droneGroup.scale.set(0.65, 0.65, 0.65);

    droneGroup.userData = {
      rotorL,
      rotorR,
      strobeLight,
      colorHex
    };

    return droneGroup;
  }

  initVessels() {
    // Spawn 3 autonomous air-taxis staggered along corridor
    const offsets = [0.0, 0.333, 0.666];
    const colors = [0x38bdf8, 0x10b981, 0xf59e0b];

    offsets.forEach((offset, idx) => {
      const droneMesh = this.createDroneModel(colors[idx]);
      if (this.scene) this.scene.add(droneMesh);

      this.vessels.push({
        mesh: droneMesh,
        progress: offset,
        speed: 0.018 + idx * 0.003, // Staggered cruising speeds
        corridor: this.corridorA
      });
    });
  }

  update(delta = 0.016, time = 0) {
    const tangent = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    this.vessels.forEach((v) => {
      v.progress = (v.progress + delta * v.speed) % 1.0;

      // 1. Position on 3D aerial curve
      const pos = v.corridor.getPointAt(v.progress);
      v.mesh.position.copy(pos);

      // 2. Align orientation with curve tangent
      v.corridor.getTangentAt(v.progress, tangent);
      v.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

      // 3. Subtle bank angle during turns
      const nextTangent = v.corridor.getTangentAt((v.progress + 0.02) % 1.0);
      const turn = tangent.x * nextTangent.z - tangent.z * nextTangent.x;
      v.mesh.rotation.z = -turn * 4.0;

      // 4. Spin rotor blades
      if (v.mesh.userData.rotorL && v.mesh.userData.rotorR) {
        v.mesh.userData.rotorL.rotation.y += delta * 45.0;
        v.mesh.userData.rotorR.rotation.y -= delta * 45.0;
      }

      // 5. Pulse anti-collision strobe beacon at 1.5 Hz
      if (v.mesh.userData.strobeLight) {
        const strobePhase = Math.sin(time * 9.42); // ~1.5 Hz
        v.mesh.userData.strobeLight.visible = strobePhase > 0.4;
      }
    });
  }
}
