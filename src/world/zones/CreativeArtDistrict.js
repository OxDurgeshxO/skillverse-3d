import * as THREE from 'three';

export class CreativeArtDistrict {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(-120, 5, 120);
    this.kineticSculptures = [];
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Modular vibrant studios (terracotta, magenta, cyan, canary yellow)
    const studioColors = [0xec4899, 0x06b6d4, 0xf59e0b, 0x8b5cf6, 0x10b981];
    const studioConfigs = [
      { x: -25, z: -15, w: 14, h: 12, d: 14, color: studioColors[0] },
      { x: 20, z: -20, w: 16, h: 16, d: 12, color: studioColors[1] },
      { x: -30, z: 25, w: 18, h: 10, d: 16, color: studioColors[2] },
      { x: 18, z: 25, w: 12, h: 14, d: 14, color: studioColors[3] },
      { x: 0, z: -35, w: 22, h: 18, d: 10, color: studioColors[4] }
    ];

    studioConfigs.forEach(s => {
      const geom = new THREE.BoxGeometry(s.w, s.h, s.d);
      const mat = new THREE.MeshStandardMaterial({
        color: s.color,
        roughness: 0.35,
        metalness: 0.2
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(s.x, s.h / 2, s.z);
      mesh.castShadow = true;
      this.group.add(mesh);

      // Glass skylight / picture window
      const winGeom = new THREE.BoxGeometry(s.w * 0.7, s.h * 0.4, 0.2);
      const winMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const win = new THREE.Mesh(winGeom, winMat);
      win.position.set(s.x, s.h * 0.6, s.z + s.d / 2 + 0.1);
      this.group.add(win);
    });

    // Central Kinetic Art Sculpture: Interlocking rotating Mobius rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      metalness: 0.9,
      roughness: 0.1
    });
    const ringGeom1 = new THREE.TorusGeometry(8, 0.8, 16, 64);
    this.ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    this.ring1.position.set(0, 14, 0);
    this.group.add(this.ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      metalness: 0.9,
      roughness: 0.1
    });
    const ringGeom2 = new THREE.TorusGeometry(6, 0.6, 16, 64);
    this.ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    this.ring2.position.set(0, 14, 0);
    this.group.add(this.ring2);

    // Neon Concert Stage / Amphitheater
    const stageGeom = new THREE.CylinderGeometry(15, 17, 2, 24);
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2 });
    const stage = new THREE.Mesh(stageGeom, stageMat);
    stage.position.set(0, 1, 0);
    this.group.add(stage);

    // Light columns
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const colGeom = new THREE.CylinderGeometry(0.3, 0.3, 16, 8);
      const colMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const col = new THREE.Mesh(colGeom, colMat);
      col.position.set(Math.cos(angle) * 14, 8, Math.sin(angle) * 14);
      this.group.add(col);
    }
  }

  update(time) {
    if (this.ring1) {
      this.ring1.rotation.x = time * 0.8;
      this.ring1.rotation.y = time * 0.5;
    }
    if (this.ring2) {
      this.ring2.rotation.y = -time * 0.9;
      this.ring2.rotation.z = time * 0.7;
    }
  }
}
