import * as THREE from 'three';
import { createHologramMaterial } from '../../shaders/hologramShader.js';

export class AncientHistoryRuins {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(-60, 3, 250); // Southern desert/ruins plateau
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Weathered Sandstone Columns & Temple
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.95,
      metalness: 0.05
    });

    // Temple Stepped Base
    for (let l = 0; l < 4; l++) {
      const stepGeom = new THREE.BoxGeometry(40 - l * 8, 2, 40 - l * 8);
      const step = new THREE.Mesh(stepGeom, stoneMat);
      step.position.y = 1 + l * 2;
      step.castShadow = true;
      step.receiveShadow = true;
      this.group.add(step);
    }

    // Colonnade Pillars
    for (let c = 0; c < 12; c++) {
      const angle = (c / 12) * Math.PI * 2;
      const colGeom = new THREE.CylinderGeometry(1.2, 1.4, 16, 12);
      const col = new THREE.Mesh(colGeom, stoneMat);
      col.position.set(Math.cos(angle) * 14, 16, Math.sin(angle) * 14);
      col.castShadow = true;
      this.group.add(col);
    }

    // Temple Architrave ring
    const ringGeom = new THREE.TorusGeometry(14, 1.2, 8, 24);
    ringGeom.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeom, stoneMat);
    ring.position.y = 24;
    this.group.add(ring);

    // Holographic Archaeological Laser Restoration Grid
    const holoGeom = new THREE.CylinderGeometry(16, 16, 26, 16, 1, true);
    this.holoMat = createHologramMaterial(0xf59e0b);
    this.scanGrid = new THREE.Mesh(holoGeom, this.holoMat);
    this.scanGrid.position.y = 13;
    this.group.add(this.scanGrid);

    // Medium 2: 3 Rotating Laser Mirror Pedestals & Golden Restoration Grid
    this.mirrors = [];
    this.isRestored = false;
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.8, roughness: 0.2 });
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 });

    for (let m = 0; m < 3; m++) {
      const angle = (m / 3) * Math.PI * 2;
      const ped = new THREE.Group();
      ped.position.set(Math.cos(angle) * 26, 2, Math.sin(angle) * 26);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 3, 12), pedMat);
      base.position.y = 1.5;
      ped.add(base);

      const mirrorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.2), pedMat);
      mirrorMesh.position.y = 3.2;
      ped.add(mirrorMesh);

      // Laser Beam pointing inward toward temple center
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 26, 8), beamMat);
      beam.rotateZ(Math.PI / 2);
      beam.position.set(0, 3.2, 0);
      ped.add(beam);

      this.group.add(ped);
      this.mirrors.push({ group: ped, angle: 0 });
    }
  }

  alignMirrors() {
    this.isRestored = true;
    if (this.holoMat && this.holoMat.uniforms) {
      this.holoMat.uniforms.uColor = { value: new THREE.Color(0xfbbf24) };
    }
    return true;
  }

  update(time) {
    if (this.holoMat && this.holoMat.uniforms) {
      this.holoMat.uniforms.uTime.value = time;
    }
    if (this.scanGrid && this.isRestored) {
      this.scanGrid.rotation.y = time * 0.4;
      this.scanGrid.scale.setScalar(1.0 + Math.sin(time * 2.0) * 0.04);
    }
  }
}
