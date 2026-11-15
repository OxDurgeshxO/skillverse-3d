import * as THREE from 'three';
import { createHologramMaterial } from '../shaders/hologramShader.js';
import { createSubsurfaceMaterial } from '../shaders/subsurfaceShader.js';

export class ExplorerAvatar {
  constructor(scene, targetHeight = 0.38) {
    this.scene = scene;
    this.targetHeight = targetHeight; // 38 cm miniature explorer scale (only slightly taller than 30 cm robots)
    this.nominalHeight = 1.75;
    this.group = new THREE.Group();
    this.group.name = 'explorer_avatar';
    this.buildAvatar();
    this.scene.add(this.group);
  }

  buildAvatar() {
    // Materials: Practical futuristic jacket with subtle fabric roughness & orange safety trim
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.15
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.5,
      metalness: 0.3
    });

    // Realistic Sub-Surface Scattering skin material
    const skinMat = createSubsurfaceMaterial(0xdeb887, 0xff7b61, 0.55);

    // Torso / Jacket
    const torsoGeom = new THREE.BoxGeometry(0.42, 0.55, 0.26);
    this.torso = new THREE.Mesh(torsoGeom, jacketMat);
    this.torso.position.y = 1.18;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Jacket High Collar
    const collarGeom = new THREE.CylinderGeometry(0.14, 0.15, 0.12, 16, 1, true);
    const collar = new THREE.Mesh(collarGeom, trimMat);
    collar.position.y = 1.48;
    this.group.add(collar);

    // Head
    const headGeom = new THREE.SphereGeometry(0.11, 16, 16);
    this.head = new THREE.Mesh(headGeom, skinMat);
    this.head.position.y = 1.62;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Practical tactical hood folded back
    const hoodGeom = new THREE.CylinderGeometry(0.16, 0.18, 0.18, 12, 1, true);
    const hood = new THREE.Mesh(hoodGeom, jacketMat);
    hood.position.set(0, 1.54, -0.06);
    this.group.add(hood);

    // Left Arm (swinging)
    this.armL = new THREE.Group();
    this.armL.position.set(-0.25, 1.42, 0);
    const armLimbL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.48), jacketMat);
    armLimbL.position.y = -0.24;
    this.armL.add(armLimbL);
    this.group.add(this.armL);

    // Right Arm (holding glowing holographic tablet)
    this.armR = new THREE.Group();
    this.armR.position.set(0.25, 1.42, 0);
    const armLimbR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.48), jacketMat);
    armLimbR.position.y = -0.24;
    this.armR.add(armLimbR);

    // Forearm angled forward holding tablet
    const forearmR = new THREE.Group();
    forearmR.position.set(0, -0.42, 0);
    forearmR.rotation.x = -Math.PI / 3;
    const forearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.35), jacketMat);
    forearmMesh.position.y = -0.16;
    forearmR.add(forearmMesh);

    // Handheld Holographic Tablet
    const tabletFrameGeom = new THREE.BoxGeometry(0.24, 0.015, 0.16);
    const tabletFrameMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9 });
    const tabletFrame = new THREE.Mesh(tabletFrameGeom, tabletFrameMat);
    tabletFrame.position.set(0, -0.35, 0.12);
    forearmR.add(tabletFrame);

    // Volumetric Holographic Display projecting from tablet
    const holoScreenGeom = new THREE.PlaneGeometry(0.22, 0.14);
    this.holoScreenMat = createHologramMaterial(0x38bdf8);
    const holoScreen = new THREE.Mesh(holoScreenGeom, this.holoScreenMat);
    holoScreen.rotation.x = -Math.PI / 2;
    holoScreen.position.set(0, -0.33, 0.12);
    forearmR.add(holoScreen);

    this.armR.add(forearmR);
    this.group.add(this.armR);

    // Legs
    this.legL = new THREE.Group();
    this.legL.position.set(-0.12, 0.9, 0);
    const legLimbL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.72), pantsMat);
    legLimbL.position.y = -0.36;
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.22), bootMat);
    bootL.position.set(0, -0.72, 0.04);
    this.legL.add(legLimbL);
    this.legL.add(bootL);
    this.group.add(this.legL);

    this.legR = new THREE.Group();
    this.legR.position.set(0.12, 0.9, 0);
    const legLimbR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.72), pantsMat);
    legLimbR.position.y = -0.36;
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.22), bootMat);
    bootR.position.set(0, -0.72, 0.04);
    this.legR.add(legLimbR);
    this.legR.add(bootR);
    this.group.add(this.legR);

    // Scale down from 1.75m to exact target height (0.38m = 38cm)
    const scale = this.targetHeight / this.nominalHeight;
    this.group.scale.set(scale, scale, scale);

    // Position walking down Tech City boulevard heading toward maglev station
    this.group.position.set(-0.5, 0.05, 54);

    this.dustPuffs = [];
    if (this.scene) {
      const geom = new THREE.SphereGeometry(0.04, 6, 6);
      for (let i = 0; i < 8; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.0 });
        const puff = new THREE.Mesh(geom, mat);
        puff.visible = false;
        this.scene.add(puff);
        this.dustPuffs.push({ mesh: puff, life: 0 });
      }
    }
  }

  update(delta, time) {
    const walkSpeed = 3.6;
    const legAngle = Math.sin(time * walkSpeed) * 0.38;
    this.legL.rotation.x = legAngle;
    this.legR.rotation.x = -legAngle;

    this.armL.rotation.x = -legAngle * 0.7;

    this.torso.position.y = 1.18 + Math.abs(Math.sin(time * walkSpeed)) * 0.03;
    this.head.position.y = 1.62 + Math.abs(Math.sin(time * walkSpeed)) * 0.03;

    // Small 3: Surface footstep decals & ground dust puffs
    if (this.dustPuffs && Math.abs(Math.cos(time * walkSpeed)) > 0.96) {
      const puff = this.dustPuffs.find(p => p.life <= 0);
      if (puff) {
        puff.mesh.position.set(this.group.position.x + (Math.random() - 0.5) * 0.1, 0.02, this.group.position.z);
        puff.mesh.scale.setScalar(0.8);
        puff.mesh.material.opacity = 0.5;
        puff.mesh.visible = true;
        puff.life = 0.45;
      }
    }

    if (this.dustPuffs) {
      this.dustPuffs.forEach(p => {
        if (p.life > 0) {
          p.life -= delta;
          p.mesh.position.y += delta * 0.15;
          p.mesh.scale.multiplyScalar(1.0 + delta * 1.5);
          p.mesh.material.opacity = Math.max(0.0, p.life * 1.1);
          if (p.life <= 0) p.mesh.visible = false;
        }
      });
    }

    if (this.holoScreenMat && this.holoScreenMat.uniforms) {
      this.holoScreenMat.uniforms.uTime.value = time;
    }
  }
}
