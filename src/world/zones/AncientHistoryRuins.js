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
    const scanGrid = new THREE.Mesh(holoGeom, this.holoMat);
    scanGrid.position.y = 13;
    this.group.add(scanGrid);
  }

  update(time) {
    if (this.holoMat && this.holoMat.uniforms) {
      this.holoMat.uniforms.uTime.value = time;
    }
  }
}
