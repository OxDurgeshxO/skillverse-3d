import * as THREE from 'three';

export class AdventureMountains {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(-360, 20, -260); // High mountain range
    this.pineTrees = [];
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Sharp Alpine Spires & Granite Crags
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      flatShading: true
    });

    const spireConfigs = [
      { x: 0, z: 0, r: 40, h: 140 },
      { x: -50, z: 30, r: 35, h: 110 },
      { x: 45, z: -40, r: 30, h: 125 },
      { x: 30, z: 40, r: 25, h: 95 },
      { x: -40, z: -50, r: 32, h: 105 }
    ];

    spireConfigs.forEach(s => {
      const geom = new THREE.ConeGeometry(s.r, s.h, 7);
      const mesh = new THREE.Mesh(geom, rockMat);
      mesh.position.set(s.x, s.h / 2, s.z);
      mesh.castShadow = true;
      this.group.add(mesh);

      // Snow-capped summit
      const snowGeom = new THREE.ConeGeometry(s.r * 0.35, s.h * 0.35, 7);
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      const snow = new THREE.Mesh(snowGeom, snowMat);
      snow.position.set(s.x, s.h * 0.82, s.z);
      this.group.add(snow);
    });

    // Procedural Alpine Pine Forest
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });

    for (let i = 0; i < 45; i++) {
      const treeGroup = new THREE.Group();
      const x = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      if (Math.hypot(x, z) < 25) continue; // Don't block trail

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 4, 6), trunkMat);
      trunk.position.y = 2;
      treeGroup.add(trunk);

      for (let t = 0; t < 3; t++) {
        const fCone = new THREE.Mesh(new THREE.ConeGeometry(3 - t * 0.7, 4, 7), foliageMat);
        fCone.position.y = 4 + t * 2.2;
        fCone.castShadow = true;
        treeGroup.add(fCone);
      }

      treeGroup.position.set(x, 0, z);
      this.group.add(treeGroup);
      this.pineTrees.push(treeGroup);
    }

    // Suspension Hiking Bridge crossing between two peaks
    const bridgeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-30, 60, 10),
      new THREE.Vector3(0, 52, 10),
      new THREE.Vector3(30, 60, 10)
    );
    const bridgeGeom = new THREE.TubeGeometry(bridgeCurve, 20, 0.4, 8, false);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const bridgeMesh = new THREE.Mesh(bridgeGeom, bridgeMat);
    this.group.add(bridgeMesh);

    // Waterfall stream
    const waterGeom = new THREE.PlaneGeometry(6, 70);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.75
    });
    this.waterfall = new THREE.Mesh(waterGeom, waterMat);
    this.waterfall.position.set(15, 35, 12);
    this.waterfall.rotation.y = Math.PI / 4;
    this.group.add(this.waterfall);
  }

  update(time) {
    if (this.waterfall) {
      this.waterfall.material.opacity = 0.65 + Math.sin(time * 12.0) * 0.15;
    }
  }
}
