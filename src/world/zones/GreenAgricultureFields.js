import * as THREE from 'three';

export class GreenAgricultureFields {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(-150, 4, -80);
    this.harvesters = [];
    this.turbines = [];
    this.buildZone();
    this.scene.add(this.group);
  }

  buildZone() {
    // 1. Organic Terraced Crop Fields
    this.buildTerracedFields();

    // 2. High-Tech Geodesic Hydroponic Glass Biodomes
    this.buildBiodomes();

    // 3. Kinetic Clean Energy Wind Turbines
    this.buildWindTurbines();

    // 4. Solar Tracking Photovoltaic Arrays
    this.buildSolarArrays();

    // 5. Smart Autonomous Harvester Pods
    this.buildHarvesters();
  }

  buildTerracedFields() {
    // Step-tiered organic contour fields
    const cropColors = [
      0x15803d, // Emerald leafy greens
      0xd97706, // Golden harvest wheat
      0x166534, // Deep forest tea/kale
      0x7c3aed, // Purple lavender
      0x65a30d  // Bright microgreens
    ];

    const terraceConfigs = [
      { r: 42, h: 0.8, y: 0.4, color: cropColors[0] },
      { r: 34, h: 0.9, y: 1.2, color: cropColors[1] },
      { r: 26, h: 1.0, y: 2.1, color: cropColors[2] },
      { r: 18, h: 1.1, y: 3.1, color: cropColors[3] }
    ];

    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
      metalness: 0.2
    });

    terraceConfigs.forEach(t => {
      // Crop circular bed
      const cropGeom = new THREE.CylinderGeometry(t.r, t.r + 1.2, t.h, 32);
      const cropMat = new THREE.MeshStandardMaterial({
        color: t.color,
        roughness: 0.75,
        metalness: 0.1
      });
      const cropMesh = new THREE.Mesh(cropGeom, cropMat);
      cropMesh.position.set(0, t.y, 10);
      cropMesh.receiveShadow = true;
      this.group.add(cropMesh);

      // Stone retaining boundary curb
      const curbGeom = new THREE.TorusGeometry(t.r + 0.6, 0.4, 8, 32);
      curbGeom.rotateX(Math.PI / 2);
      const curb = new THREE.Mesh(curbGeom, borderMat);
      curb.position.set(0, t.y + t.h / 2, 10);
      this.group.add(curb);
    });
  }

  buildBiodomes() {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.85,
      roughness: 0.08,
      metalness: 0.9,
      transparent: true,
      opacity: 0.45,
      clearcoat: 1.0
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });

    const domeConfigs = [
      { x: -35, z: -35, r: 14, h: 11 },
      { x: 35, z: -35, r: 16, h: 12 },
      { x: 0, z: -55, r: 18, h: 14 }
    ];

    domeConfigs.forEach(d => {
      const domeGroup = new THREE.Group();
      domeGroup.position.set(d.x, 0, d.z);

      // Glass hemisphere
      const domeGeom = new THREE.SphereGeometry(d.r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMesh = new THREE.Mesh(domeGeom, glassMat);
      domeMesh.castShadow = true;
      domeGroup.add(domeMesh);

      // Structural geodesic frame rings
      for (let ring = 1; ring <= 3; ring++) {
        const ringR = d.r * Math.cos((ring / 4) * (Math.PI / 2));
        const ringY = d.r * Math.sin((ring / 4) * (Math.PI / 2));
        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(ringR, 0.25, 8, 32),
          frameMat
        );
        ringMesh.rotateX(Math.PI / 2);
        ringMesh.position.y = ringY;
        domeGroup.add(ringMesh);
      }

      // Base perimeter ring with warm interior grow light
      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(d.r, 0.5, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x34d399 })
      );
      baseRing.rotateX(Math.PI / 2);
      baseRing.position.y = 0.2;
      domeGroup.add(baseRing);

      // Interior vertical aeroponic core
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, d.h * 0.8, 12),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
      );
      core.position.y = (d.h * 0.8) / 2;
      domeGroup.add(core);

      this.group.add(domeGroup);
    });
  }

  buildWindTurbines() {
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.85, roughness: 0.2 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });

    const turbinePositions = [
      { x: -55, z: 25 },
      { x: -65, z: -10 },
      { x: 55, z: 20 }
    ];

    turbinePositions.forEach(pos => {
      const tGroup = new THREE.Group();
      tGroup.position.set(pos.x, 0, pos.z);

      // Tapered tower mast
      const mastGeom = new THREE.CylinderGeometry(0.5, 1.2, 36, 16);
      const mast = new THREE.Mesh(mastGeom, mastMat);
      mast.position.y = 18;
      mast.castShadow = true;
      tGroup.add(mast);

      // Nacelle generator box
      const nacelleGeom = new THREE.BoxGeometry(2.2, 1.8, 4.5);
      const nacelle = new THREE.Mesh(nacelleGeom, mastMat);
      nacelle.position.set(0, 36, 0.8);
      tGroup.add(nacelle);

      // Rotor hub and 3 aerodynamic blades
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 36, 3.2);

      const hub = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.6, 16), mastMat);
      hub.rotateX(Math.PI / 2);
      rotorGroup.add(hub);

      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = (b * Math.PI * 2) / 3;

        const bladeGeom = new THREE.BoxGeometry(0.5, 16, 0.12);
        const blade = new THREE.Mesh(bladeGeom, bladeMat);
        blade.position.y = 8;
        bladeArm.add(blade);

        rotorGroup.add(bladeArm);
      }

      tGroup.add(rotorGroup);
      this.group.add(tGroup);
      this.turbines.push(rotorGroup);
    });
  }

  buildSolarArrays() {
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.95,
      roughness: 0.1
    });
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3
    });

    const panelGeom = new THREE.BoxGeometry(7, 0.3, 4.5);
    panelGeom.rotateX(0.35); // Angled to golden hour sun

    for (let i = 0; i < 8; i++) {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8), standMat);
      const posX = 30 + (i % 3) * 11;
      const posZ = 10 + Math.floor(i / 3) * 9;
      stand.position.set(posX, 1.25, posZ);
      this.group.add(stand);

      const panel = new THREE.Mesh(panelGeom, panelMat);
      panel.position.set(posX, 2.6, posZ);
      panel.castShadow = true;
      this.group.add(panel);
    }
  }

  buildHarvesters() {
    for (let h = 0; h < 3; h++) {
      const hGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 2.2, 6.5),
        new THREE.MeshStandardMaterial({ color: 0x65a30d, metalness: 0.5, roughness: 0.4 })
      );
      body.position.y = 1.4;
      body.castShadow = true;
      hGroup.add(body);

      // Glass cockpit cab
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 1.6, 2.8),
        new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.8, opacity: 0.5, transparent: true })
      );
      cab.position.set(0, 2.8, 1.0);
      hGroup.add(cab);

      // Big rubber tractor tires
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 });
      const tireGeom = new THREE.CylinderGeometry(1.1, 1.1, 0.9, 16);
      tireGeom.rotateZ(Math.PI / 2);

      [
        [-2.4, 1.1, -1.8],
        [2.4, 1.1, -1.8],
        [-2.4, 1.1, 1.8],
        [2.4, 1.1, 1.8]
      ].forEach(([tx, ty, tz]) => {
        const tire = new THREE.Mesh(tireGeom, tireMat);
        tire.position.set(tx, ty, tz);
        hGroup.add(tire);
      });

      // Front rotating cutter reel
      const reel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 4.8, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 })
      );
      reel.rotation.z = Math.PI / 2;
      reel.position.set(0, 0.9, 3.8);
      hGroup.add(reel);

      hGroup.position.set(-25 + h * 25, 0, 42);
      this.group.add(hGroup);
      this.harvesters.push({ group: hGroup, baseX: -25 + h * 25, reel });
    }
  }

  update(time) {
    // Rotate wind turbine blades
    this.turbines.forEach((turb, idx) => {
      turb.rotation.z = time * (1.2 + idx * 0.15);
    });

    // Animate harvester movement along crop rows
    this.harvesters.forEach((h, idx) => {
      const offset = idx * 1.5;
      h.group.position.x = h.baseX + Math.sin(time * 0.6 + offset) * 8;
      if (h.reel) {
        h.reel.rotation.x = time * 4.0;
      }
    });
  }
}
