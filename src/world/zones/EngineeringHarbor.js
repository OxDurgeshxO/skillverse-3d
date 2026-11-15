import * as THREE from 'three';

export class EngineeringHarbor {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(240, 2, -40); // Waterfront inlet
    this.cranes = [];
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // 1. Concrete Quays and Mooring Wharves
    const dockGeom = new THREE.BoxGeometry(70, 4, 140);
    const dockMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.15
    });
    const dock = new THREE.Mesh(dockGeom, dockMat);
    dock.position.set(0, 0, 0);
    dock.receiveShadow = true;
    this.group.add(dock);

    // Granite bollards along the water edge
    const bollardGeom = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 12);
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
    for (let bz = -60; bz <= 60; bz += 15) {
      const b = new THREE.Mesh(bollardGeom, bollardMat);
      b.position.set(33.5, 2.45, bz);
      this.group.add(b);
    }

    // 2. High-Fidelity Ship-to-Shore (STS) Container Cranes
    this.buildContainerCranes();

    // 3. Detailed Container Cargo Ship
    this.buildCargoShip();

    // 4. Stacks of ISO Shipping Containers on Quayside
    this.buildContainerStacks();
  }

  buildContainerCranes() {
    const cranePositions = [-40, 0, 40];
    const craneMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Safety orange
      roughness: 0.35,
      metalness: 0.75
    });
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    cranePositions.forEach(z => {
      const craneGroup = new THREE.Group();
      craneGroup.position.set(22, 2, z);

      // A-frame portal legs
      const legGeom = new THREE.BoxGeometry(1.6, 32, 1.6);
      [
        { x: -7, z: -5, rotZ: -0.1 },
        { x: 7, z: -5, rotZ: 0.1 },
        { x: -7, z: 5, rotZ: -0.1 },
        { x: 7, z: 5, rotZ: 0.1 }
      ].forEach(cfg => {
        const leg = new THREE.Mesh(legGeom, craneMat);
        leg.position.set(cfg.x, 16, cfg.z);
        leg.rotation.z = cfg.rotZ;
        craneGroup.add(leg);
      });

      // Upper portal beam
      const portalBeam = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 12), craneMat);
      portalBeam.position.set(0, 31, 0);
      craneGroup.add(portalBeam);

      // Long horizontal outreach boom extending over ship
      const boomGeom = new THREE.BoxGeometry(55, 2.5, 3.0);
      const boom = new THREE.Mesh(boomGeom, craneMat);
      boom.position.set(16, 33, 0);
      craneGroup.add(boom);

      // Operator glass cabin under the trolley
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.5, 2.8), cabinMat);
      cabin.position.set(12, 30.5, 0);
      craneGroup.add(cabin);

      // Motorized spreader & suspended container
      const trolleyGroup = new THREE.Group();
      trolleyGroup.position.set(24, 31, 0);

      // Hoist cables
      const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 14), cableMat);
      c1.position.set(-3.5, -7, 0);
      trolleyGroup.add(c1);

      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 14), cableMat);
      c2.position.set(3.5, -7, 0);
      trolleyGroup.add(c2);

      // Suspended 40ft container
      const contGeom = new THREE.BoxGeometry(12, 4.5, 4.2);
      const contMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
      const container = new THREE.Mesh(contGeom, contMat);
      container.position.set(0, -14, 0);
      trolleyGroup.add(container);

      craneGroup.add(trolleyGroup);
      this.group.add(craneGroup);
      this.cranes.push({ group: craneGroup, trolley: trolleyGroup, baseZ: z });
    });
  }

  buildCargoShip() {
    const shipGroup = new THREE.Group();
    shipGroup.position.set(52, -1, 0);

    // Main steel hull (Dark navy)
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.55,
      metalness: 0.45
    });

    // Hull lower red anti-fouling strip
    const keelMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
    const keel = new THREE.Mesh(new THREE.BoxGeometry(26, 4, 100), keelMat);
    keel.position.y = 0;
    shipGroup.add(keel);

    const mainHull = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 100), hullMat);
    mainHull.position.y = 6;
    shipGroup.add(mainHull);

    // Bow wedge (tapered front)
    const bow = new THREE.Mesh(new THREE.ConeGeometry(13, 22, 4), hullMat);
    bow.rotateX(Math.PI / 2);
    bow.scale.set(1.0, 1.0, 0.5);
    bow.position.set(0, 6, -58);
    shipGroup.add(bow);

    // Aft Accommodation & Bridge Superstructure
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const bridgeTower = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 18), bridgeMat);
    bridgeTower.position.set(0, 15, 34);
    shipGroup.add(bridgeTower);

    // Navigation bridge panoramic window strip
    const navWindow = new THREE.Mesh(new THREE.BoxGeometry(22.2, 2.2, 6), windowMat);
    navWindow.position.set(0, 20, 36);
    shipGroup.add(navWindow);

    // Exhaust Smokestack / Funnel
    const funnel = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.5, 9, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
    );
    funnel.position.set(0, 24, 28);
    shipGroup.add(funnel);

    // Stacks of containers on the ship deck
    const shipContColors = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed];
    for (let row = 0; row < 5; row++) {
      for (let col = -1; col <= 1; col++) {
        for (let tier = 0; tier < 2; tier++) {
          const sc = new THREE.Mesh(
            new THREE.BoxGeometry(7.5, 4.0, 12),
            new THREE.MeshStandardMaterial({
              color: shipContColors[(row + col + tier + 5) % shipContColors.length],
              roughness: 0.5
            })
          );
          sc.position.set(col * 8, 12 + tier * 4.2, -35 + row * 13);
          sc.castShadow = true;
          shipGroup.add(sc);
        }
      }
    }

    this.group.add(shipGroup);
  }

  buildContainerStacks() {
    const stackColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x6366f1];
    for (let i = 0; i < 28; i++) {
      const cg = new THREE.BoxGeometry(9, 4.0, 4.2);
      const cm = new THREE.MeshStandardMaterial({
        color: stackColors[i % stackColors.length],
        roughness: 0.5
      });
      const c = new THREE.Mesh(cg, cm);
      const col = i % 4;
      const row = Math.floor(i / 8);
      const tier = Math.floor((i % 8) / 4);

      c.position.set(-20 + col * 9.5, 3.8 + tier * 4.1, -40 + row * 18);
      c.castShadow = true;
      c.receiveShadow = true;
      this.group.add(c);
    }
  }

  update(time) {
    // Gentle sway of suspended crane containers
    this.cranes.forEach((crane, idx) => {
      if (crane.trolley) {
        crane.trolley.rotation.z = Math.sin(time * 1.5 + idx) * 0.04;
      }
    });
  }
}
