import * as THREE from 'three';
import { createHologramMaterial } from '../../shaders/hologramShader.js';

export class GlobalLearningUniversity {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(80, 5, -120); // North-east campus sector
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Concentric Academic Rings (Warm ivory and brushed copper)
    const uniMat = new THREE.MeshStandardMaterial({
      color: 0xfafaf9,
      roughness: 0.25,
      metalness: 0.2
    });

    // Outer Ring Building
    const outerGeom = new THREE.CylinderGeometry(40, 40, 14, 32, 1, true, 0, Math.PI * 1.6);
    const outer = new THREE.Mesh(outerGeom, uniMat);
    outer.position.y = 7;
    outer.castShadow = true;
    this.group.add(outer);

    // Inner Ring Building
    const innerGeom = new THREE.CylinderGeometry(24, 24, 20, 24, 1, true, Math.PI * 0.4, Math.PI * 1.5);
    const inner = new THREE.Mesh(innerGeom, uniMat);
    inner.position.y = 10;
    inner.castShadow = true;
    this.group.add(inner);

    // Central Library Knowledge Spire (Spiral crystalline spire reaching 65m)
    const spireGeom = new THREE.ConeGeometry(5, 65, 8);
    const spireMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.9,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.8
    });
    const spire = new THREE.Mesh(spireGeom, spireMat);
    spire.position.y = 32.5;
    spire.castShadow = true;
    this.group.add(spire);

    // Holographic Planetary Knowledge Globe floating in central amphitheater
    const globeGeom = new THREE.SphereGeometry(6, 24, 24);
    this.globeMat = createHologramMaterial(0x38bdf8);
    this.knowledgeGlobe = new THREE.Mesh(globeGeom, this.globeMat);
    this.knowledgeGlobe.position.y = 18;
    this.group.add(this.knowledgeGlobe);
  }

  update(time) {
    if (this.knowledgeGlobe) {
      this.knowledgeGlobe.rotation.y = time * 0.4;
      this.knowledgeGlobe.position.y = 18 + Math.sin(time * 2.0) * 0.8;
    }
    if (this.globeMat && this.globeMat.uniforms) {
      this.globeMat.uniforms.uTime.value = time;
    }
  }
}
