import * as THREE from 'three';
import { createHologramMaterial } from '../../shaders/hologramShader.js';

export class AIResearchValley {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(-240, 25, -160); // In the mountain valley
    this.neuralOrbs = [];
    this.quantumRings = [];
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // 1. Geodesic Research Biodomes with Hexagonal Frames
    this.buildGeodesicDomes();

    // 2. Elevated Tubular Skyways connecting the research cluster
    this.buildSkyways();

    // 3. Central Quantum Neural Core & Containment Rings
    this.buildQuantumCore();

    // 4. Orbiting Data Energy Orbs
    this.buildDataOrbs();

    // 5. Holographic Analysis Pedestal
    this.buildHoloPedestal();
  }

  buildGeodesicDomes() {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9333ea,
      emissive: 0x581c87,
      emissiveIntensity: 0.25,
      transmission: 0.82,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1.0
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });

    const domeConfigs = [
      { x: 0, z: 0, r: 18, h: 14, segments: 24 },
      { x: -32, z: 22, r: 14, h: 10, segments: 20 },
      { x: 30, z: -18, r: 15, h: 11, segments: 20 },
      { x: 14, z: 36, r: 13, h: 9, segments: 18 }
    ];

    domeConfigs.forEach(d => {
      const dGroup = new THREE.Group();
      dGroup.position.set(d.x, 0, d.z);

      // Multi-faceted dome shell
      const geom = new THREE.SphereGeometry(d.r, d.segments, d.segments / 2, 0, Math.PI * 2, 0, Math.PI / 2);
      const mesh = new THREE.Mesh(geom, glassMat);
      mesh.castShadow = true;
      dGroup.add(mesh);

      // Structural hexagonal rib rings
      for (let ring = 1; ring <= 3; ring++) {
        const ringR = d.r * Math.cos((ring / 4) * (Math.PI / 2));
        const ringY = d.r * Math.sin((ring / 4) * (Math.PI / 2));
        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(ringR, 0.28, 8, d.segments),
          frameMat
        );
        ringMesh.rotateX(Math.PI / 2);
        ringMesh.position.y = ringY;
        dGroup.add(ringMesh);
      }

      // Violet illuminated foundation ring
      const ringGeom = new THREE.TorusGeometry(d.r, 0.45, 8, 36);
      ringGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = 0.25;
      dGroup.add(ring);

      this.group.add(dGroup);
    });
  }

  buildSkyways() {
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      transmission: 0.85,
      roughness: 0.1,
      metalness: 0.8
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });

    const connections = [
      { x1: 0, z1: 0, x2: -32, z2: 22, y: 5 },
      { x1: 0, z1: 0, x2: 30, z2: -18, y: 5 },
      { x1: 0, z1: 0, x2: 14, z2: 36, y: 5 }
    ];

    connections.forEach(conn => {
      const p1 = new THREE.Vector3(conn.x1, conn.y, conn.z1);
      const p2 = new THREE.Vector3(conn.x2, conn.y, conn.z2);
      const dist = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);

      const tubeGeom = new THREE.CylinderGeometry(1.6, 1.6, dist, 16, 1, true);
      const tube = new THREE.Mesh(tubeGeom, tubeMat);
      tube.position.copy(mid);
      tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      this.group.add(tube);

      // Support pillars
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, conn.y, 8), frameMat);
      pillar.position.set(mid.x, conn.y / 2, mid.z);
      this.group.add(pillar);
    });
  }

  buildQuantumCore() {
    // Pulsing central neural icosahedron
    const coreGeom = new THREE.IcosahedronGeometry(6.5, 2);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      wireframe: true
    });
    this.neuralCore = new THREE.Mesh(coreGeom, this.coreMat);
    this.neuralCore.position.set(0, 24, 0);
    this.group.add(this.neuralCore);

    // Kinetic Concentric Quantum Containment Rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    for (let i = 0; i < 3; i++) {
      const qRing = new THREE.Mesh(new THREE.TorusGeometry(9 + i * 2.8, 0.18, 8, 36), ringMat);
      qRing.position.set(0, 24, 0);
      this.group.add(qRing);
      this.quantumRings.push(qRing);
    }
  }

  buildDataOrbs() {
    for (let i = 0; i < 8; i++) {
      const orbGeom = new THREE.SphereGeometry(1.1, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const orb = new THREE.Mesh(orbGeom, orbMat);
      this.group.add(orb);
      this.neuralOrbs.push({
        mesh: orb,
        angle: (i / 8) * Math.PI * 2,
        radius: 13 + (i % 3) * 3,
        speed: 0.8 + i * 0.15,
        yBase: 24 + (i % 2) * 4
      });
    }
  }

  buildHoloPedestal() {
    const holoGeom = new THREE.CylinderGeometry(8, 8, 14, 20, 1, true);
    this.holoMat = createHologramMaterial(0xa855f7);
    const holo = new THREE.Mesh(holoGeom, this.holoMat);
    holo.position.set(0, 10, 0);
    this.group.add(holo);
  }

  update(time) {
    if (this.neuralCore) {
      this.neuralCore.rotation.y = time * 0.6;
      this.neuralCore.rotation.x = time * 0.35;
      const pulse = Math.sin(time * 3.2) * 0.35 + 0.75;
      this.coreMat.emissiveIntensity = pulse * 1.6;
    }

    // Rotate quantum containment rings across orthogonal axes
    this.quantumRings.forEach((qRing, idx) => {
      if (idx === 0) qRing.rotation.x = time * 0.8;
      if (idx === 1) qRing.rotation.y = time * 0.6;
      if (idx === 2) qRing.rotation.z = time * 0.9;
    });

    this.neuralOrbs.forEach(orb => {
      const currentAngle = orb.angle + time * orb.speed;
      orb.mesh.position.set(
        Math.cos(currentAngle) * orb.radius,
        orb.yBase + Math.sin(time * 2.2 + orb.angle) * 2,
        Math.sin(currentAngle) * orb.radius
      );
    });

    if (this.holoMat && this.holoMat.uniforms) {
      this.holoMat.uniforms.uTime.value = time;
    }
  }
}
