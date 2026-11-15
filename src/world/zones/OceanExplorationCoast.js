import * as THREE from 'three';

export class OceanExplorationCoast {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(380, -4, 260); // Coastal shelf
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // Offshore Hexagonal Deep-Sea Research Rig
    const rigGeom = new THREE.CylinderGeometry(20, 20, 6, 6);
    const rigMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3
    });
    this.rig = new THREE.Mesh(rigGeom, rigMat);
    this.rig.position.set(0, 5, 0);
    this.rig.castShadow = true;
    this.group.add(this.rig);

    // Rig Support Pillars descending into water
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 20, 12), pillarMat);
      pillar.position.set(Math.cos(angle) * 14, -5, Math.sin(angle) * 14);
      this.group.add(pillar);
    }

    // Dome on Research Rig
    const domeGeom = new THREE.SphereGeometry(10, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.7,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1
    });
    const dome = new THREE.Mesh(domeGeom, domeMat);
    dome.position.set(0, 8, 0);
    this.group.add(dome);

    // Robotic Autonomous Exploration Submersible
    const subGroup = new THREE.Group();
    const subBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(2.5, 8, 12, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.3 })
    );
    subBody.rotation.x = Math.PI / 2;
    subGroup.add(subBody);

    // Conning tower & viewport
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    tower.position.set(0, 2.2, -0.5);
    subGroup.add(tower);

    // Submarine headlights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), lightMat);
    hl1.position.set(-1, 0, 4.5);
    const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), lightMat);
    hl2.position.set(1, 0, 4.5);
    subGroup.add(hl1);
    subGroup.add(hl2);

    subGroup.position.set(30, -2, 25);
    this.group.add(subGroup);
    this.sub = subGroup;
  }

  update(time) {
    if (this.sub) {
      this.sub.position.y = -2 + Math.sin(time * 1.5) * 1.2;
      this.sub.rotation.y = time * 0.3;
    }
  }
}
