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

    // Major 2: Underwater Submarine Dive Mode & Caustics Shader
    this.isDiving = false;
    this.targetDepth = -2;
    this.currentDepth = -2;

    // Underwater Caustic Light Plane at seabed y = -18
    const causticGeom = new THREE.PlaneGeometry(60, 60);
    causticGeom.rotateX(-Math.PI / 2);
    this.causticMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });
    this.causticPlane = new THREE.Mesh(causticGeom, this.causticMat);
    this.causticPlane.position.set(30, -18, 25);
    this.group.add(this.causticPlane);

    // Underwater Kelp Forest (swaying stalks)
    this.kelpStalks = [];
    const kelpMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 });
    for (let k = 0; k < 12; k++) {
      const angle = (k / 12) * Math.PI * 2;
      const dist = 10 + (k % 3) * 6;
      const kelp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 14, 6), kelpMat);
      kelp.position.set(30 + Math.cos(angle) * dist, -11, 25 + Math.sin(angle) * dist);
      this.group.add(kelp);
      this.kelpStalks.push(kelp);
    }
  }

  toggleDive() {
    this.isDiving = !this.isDiving;
    this.targetDepth = this.isDiving ? -16.5 : -2;
    return this.isDiving;
  }

  update(time, delta = 0.016) {
    if (this.sub) {
      this.currentDepth = THREE.MathUtils.lerp(this.currentDepth, this.targetDepth, delta * 1.5);
      this.sub.position.y = this.currentDepth + Math.sin(time * 1.5) * 0.4;
      this.sub.rotation.y = time * 0.3;
      this.sub.rotation.z = Math.sin(time * 1.2) * 0.05;
    }

    // Dynamic underwater caustics brightness modulation
    if (this.causticMat) {
      this.causticMat.opacity = 0.18 + Math.sin(time * 3.5) * 0.08;
    }

    // Swaying kelp forest
    this.kelpStalks.forEach((k, idx) => {
      k.rotation.z = Math.sin(time * 1.8 + idx) * 0.12;
      k.rotation.x = Math.cos(time * 1.4 + idx) * 0.12;
    });
  }
}
