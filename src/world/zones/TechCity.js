import * as THREE from 'three';
import { createWetPavementMaterial } from '../../shaders/wetPavementShader.js';
import { createHologramMaterial } from '../../shaders/hologramShader.js';

export class TechCity {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.holograms = [];
    this.beacons = [];
    this.streetlampMats = [];
    this.windowTexture = this.createWindowTexture();
    this.buildCity();
    this.buildNightStreetlamps();
    this.scene.add(this.group);
  }

  createWindowTexture() {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dark glass curtain wall
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 1024);

    const rows = 64;
    const cols = 16;
    const cellW = 512 / cols;
    const cellH = 1024 / rows;
    const winW = cellW * 0.72;
    const winH = cellH * 0.65;
    const padX = (cellW - winW) / 2;
    const padY = (cellH - winH) / 2;

    const palette = [
      '#fef3c7', // Warm amber office
      '#fed7aa', // Golden interior
      '#e0f2fe', // Cool daylight
      '#bae6fd', // Soft azure
      '#38bdf8', // Blue tech screen
      '#1e293b', // Dark unlit
      '#0f172a', // Dark unlit
      '#09090b'  // Dark unlit
    ];

    // Procedural office window matrix
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Pseudo-random deterministic choice
        const hash = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
        const rand = hash - Math.floor(hash);

        const x = c * cellW + padX;
        const y = r * cellH + padY;

        let colIdx;
        if (rand < 0.28) colIdx = 0; // Warm amber
        else if (rand < 0.44) colIdx = 1; // Golden
        else if (rand < 0.62) colIdx = 2; // Cool daylight
        else if (rand < 0.70) colIdx = 4; // Screen
        else colIdx = 5 + Math.floor(rand * 3) % 3; // Unlit office

        ctx.fillStyle = palette[colIdx];
        ctx.fillRect(x, y, winW, winH);

        // Window frame mullion
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, winW, winH);
      }
    }

    // Floor spandrel division lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    for (let r = 0; r <= rows; r += 4) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(512, r * cellH);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  buildCity() {
    // 1. Wet Main Boulevard: 18m wide, 180m long running along Z
    const roadGeom = new THREE.PlaneGeometry(18, 180);
    roadGeom.rotateX(-Math.PI / 2);
    this.roadMaterial = createWetPavementMaterial();
    const road = new THREE.Mesh(roadGeom, this.roadMaterial);
    road.position.set(0, 0.05, 20);
    road.receiveShadow = true;
    this.group.add(road);

    // Smart luminous road lane markings (center double dashed line)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    for (let z = -65; z <= 105; z += 6) {
      const lineGeom = new THREE.PlaneGeometry(0.25, 3.2);
      lineGeom.rotateX(-Math.PI / 2);
      const l1 = new THREE.Mesh(lineGeom, lineMat);
      l1.position.set(-0.35, 0.07, z);
      this.group.add(l1);
      const l2 = new THREE.Mesh(lineGeom, lineMat);
      l2.position.set(0.35, 0.07, z);
      this.group.add(l2);
    }

    // 2. Wide Granite Sidewalks with curbs
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x272e39,
      roughness: 0.55,
      metalness: 0.2
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.3
    });

    [-11.5, 11.5].forEach(sideX => {
      const walkGeom = new THREE.BoxGeometry(5, 0.25, 180);
      const walk = new THREE.Mesh(walkGeom, sidewalkMat);
      walk.position.set(sideX, 0.12, 20);
      walk.receiveShadow = true;
      this.group.add(walk);

      // Curb edge
      const curbX = sideX > 0 ? sideX - 2.45 : sideX + 2.45;
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 180), curbMat);
      curb.position.set(curbX, 0.15, 20);
      this.group.add(curb);
    });

    // 3. Street Furniture: Modern streetlamps and cybernetic planters
    this.buildStreetscape();

    // 4. Stepped Architectural Skyscraper Towers
    this.buildTowers();

    // 5. Elevated Holographic Billboards
    this.buildHolograms();

    // 6. Elevated Maglev Suspension Bridge & Monorail Track
    this.buildMaglevBridge();

    // 7. Glass Transit Terminal Hub at z = 30
    this.buildTransitHub();
  }

  buildStreetscape() {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    const lampLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm 3000K incandescent
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });

    for (let z = -60; z <= 100; z += 20) {
      [-9.8, 9.8].forEach(x => {
        // Modern cantilevered streetlamp
        const lampGroup = new THREE.Group();
        lampGroup.position.set(x, 0.25, z);

        // Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.5, 8), lampMat);
        mast.position.y = 2.75;
        lampGroup.add(mast);

        // Cantilever arm curving over sidewalk/road
        const armDir = x > 0 ? -1 : 1;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), lampMat);
        arm.position.set(armDir * 0.7, 5.4, 0);
        lampGroup.add(arm);

        // Luminaire emitter
        const luminaire = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.25), lampLightMat);
        luminaire.position.set(armDir * 1.0, 5.34, 0);
        lampGroup.add(luminaire);

        this.group.add(lampGroup);

        // Cybernetic Street Tree / Foliage Planter
        const planter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), planterMat);
        planter.position.set(x, 0.45, z + 7);
        this.group.add(planter);

        const treeTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.14, 2.8, 8),
          new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 })
        );
        treeTrunk.position.set(x, 1.8, z + 7);
        this.group.add(treeTrunk);

        const treeCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), foliageMat);
        treeCrown.position.set(x, 3.2, z + 7);
        treeCrown.scale.set(1, 1.3, 1);
        this.group.add(treeCrown);
      });
    }
  }

  buildTowers() {
    // Glass & Titanium Architectural Curtain Wall Material
    const towerMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.12,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95
    });

    if (this.windowTexture) {
      towerMat.map = this.windowTexture;
      towerMat.emissiveMap = this.windowTexture;
      towerMat.emissive = new THREE.Color(0xffd5a0);
      towerMat.emissiveIntensity = 0.42;
    }

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.25
    });

    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Architectural Skyscraper Complex flanking the boulevard
    const towerConfigs = [
      // Primary West Flank
      { x: -30, z: -30, w: 22, d: 26, h: 125, tiers: 3, spire: true },
      // Primary East Flank
      { x: 30, z: -25, w: 24, d: 28, h: 145, tiers: 3, spire: true },
      // Mid West Flank
      { x: -34, z: 22, w: 24, d: 24, h: 105, tiers: 2, spire: true },
      // Mid East Flank
      { x: 32, z: 26, w: 22, d: 24, h: 115, tiers: 2, spire: false },
      // South West Flank
      { x: -28, z: 72, w: 22, d: 22, h: 88, tiers: 2, spire: false },
      // South East Flank
      { x: 28, z: 78, w: 20, d: 20, h: 95, tiers: 2, spire: true },
      // Deep Background Skyline
      { x: -70, z: -15, w: 32, d: 32, h: 165, tiers: 3, spire: true },
      { x: 72, z: 8, w: 36, d: 34, h: 185, tiers: 4, spire: true },
      { x: -65, z: 65, w: 28, d: 28, h: 135, tiers: 2, spire: false },
      { x: 68, z: 85, w: 28, d: 28, h: 148, tiers: 3, spire: true }
    ];

    towerConfigs.forEach(cfg => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(cfg.x, 0, cfg.z);

      let currentH = 0;
      const tierH = cfg.h / cfg.tiers;

      for (let t = 0; t < cfg.tiers; t++) {
        const shrinkFactor = 1.0 - t * 0.18;
        const tw = cfg.w * shrinkFactor;
        const td = cfg.d * shrinkFactor;
        const th = tierH;

        // Main glass mass
        const bodyGeom = new THREE.BoxGeometry(tw, th, td);
        const body = new THREE.Mesh(bodyGeom, towerMat);
        body.position.set(0, currentH + th / 2, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        towerGroup.add(body);

        // Structural corner mullions / columns
        const colW = 0.6;
        const cornerGeom = new THREE.BoxGeometry(colW, th + 0.2, colW);
        [
          [-tw / 2, -td / 2],
          [tw / 2, -td / 2],
          [-tw / 2, td / 2],
          [tw / 2, td / 2]
        ].forEach(([cx, cz]) => {
          const corner = new THREE.Mesh(cornerGeom, frameMat);
          corner.position.set(cx, currentH + th / 2, cz);
          towerGroup.add(corner);
        });

        // Horizontal floor belt divider
        const beltGeom = new THREE.BoxGeometry(tw + 0.4, 1.2, td + 0.4);
        const belt = new THREE.Mesh(beltGeom, frameMat);
        belt.position.set(0, currentH + th, 0);
        towerGroup.add(belt);

        currentH += th;
      }

      // Rooftop Mechanical Penthouse
      const pentW = cfg.w * 0.45;
      const pentD = cfg.d * 0.45;
      const pentH = 6;
      const penthouse = new THREE.Mesh(new THREE.BoxGeometry(pentW, pentH, pentD), frameMat);
      penthouse.position.set(0, currentH + pentH / 2, 0);
      towerGroup.add(penthouse);

      // Rooftop Communication Mast / Spire with Blinking Aviation Beacon
      if (cfg.spire) {
        const spireH = 18;
        const spireGeom = new THREE.CylinderGeometry(0.12, 0.8, spireH, 8);
        const spire = new THREE.Mesh(spireGeom, frameMat);
        spire.position.set(0, currentH + pentH + spireH / 2, 0);
        towerGroup.add(spire);

        // Flashing Red Beacon
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), beaconMat);
        beacon.position.set(0, currentH + pentH + spireH, 0);
        towerGroup.add(beacon);
        this.beacons.push(beacon);
      }

      this.group.add(towerGroup);
    });

    // Enclosed Architectural Glass Skybridges between towers across boulevard
    this.buildSkybridge(-28, 28, 38, -28);
    this.buildSkybridge(-32, 30, 58, 24);
  }

  buildSkybridge(x1, x2, y, z) {
    const bridgeGroup = new THREE.Group();
    const length = Math.abs(x2 - x1);
    const midX = (x1 + x2) / 2;

    const floorGeom = new THREE.BoxGeometry(length, 0.8, 5);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    bridgeGroup.add(floor);

    const glassGeom = new THREE.BoxGeometry(length, 3.2, 4.6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.9,
      transmission: 0.85
    });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.y = 1.8;
    bridgeGroup.add(glass);

    // Glowing interior floor strip
    const lightStrip = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.1, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lightStrip.position.y = 0.45;
    bridgeGroup.add(lightStrip);

    bridgeGroup.position.set(midX, y, z);
    this.group.add(bridgeGroup);
  }

  buildHolograms() {
    const holoBillboards = [
      { x: -14, y: 18, z: -10, w: 10, h: 6, rotY: Math.PI / 6, color: 0x00e5ff },
      { x: 14, y: 22, z: 15, w: 12, h: 7, rotY: -Math.PI / 5, color: 0xff007f },
      { x: -15, y: 25, z: 45, w: 14, h: 8, rotY: Math.PI / 4, color: 0x7c3aed },
      { x: 13, y: 16, z: 65, w: 10, h: 6, rotY: -Math.PI / 6, color: 0x10b981 }
    ];

    holoBillboards.forEach(hb => {
      const geom = new THREE.PlaneGeometry(hb.w, hb.h);
      const mat = createHologramMaterial(hb.color);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(hb.x, hb.y, hb.z);
      mesh.rotation.y = hb.rotY;
      this.group.add(mesh);
      this.holograms.push(mat);
    });
  }

  buildMaglevBridge() {
    // Cross bridge at y = 14 crossing x from -42 to 42 at z = 5
    const bridgeGeom = new THREE.BoxGeometry(92, 1.4, 5.5);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.25
    });
    const bridge = new THREE.Mesh(bridgeGeom, bridgeMat);
    bridge.position.set(0, 14, 5);
    bridge.castShadow = true;
    this.group.add(bridge);

    // Twin Glowing maglev guide rails
    const railGeom = new THREE.BoxGeometry(92, 0.35, 0.5);
    const railMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rail1 = new THREE.Mesh(railGeom, railMat);
    rail1.position.set(0, 14.85, 3.8);
    this.group.add(rail1);
    const rail2 = new THREE.Mesh(railGeom, railMat);
    rail2.position.set(0, 14.85, 6.2);
    this.group.add(rail2);

    // Support pillars flanking boulevard
    [-15, 15].forEach(px => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.2, 14, 16),
        bridgeMat
      );
      pillar.position.set(px, 7, 5);
      pillar.castShadow = true;
      this.group.add(pillar);
    });
  }

  buildTransitHub() {
    // Futuristic Parametric Ribbed Glass Canopy at z = 38
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0, 42);

    const canopyGeom = new THREE.CylinderGeometry(15, 15, 24, 32, 1, true, 0, Math.PI);
    canopyGeom.rotateZ(Math.PI / 2);
    canopyGeom.rotateY(Math.PI / 2);

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      roughness: 0.08,
      metalness: 0.9,
      transmission: 0.85
    });
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 10, 0);
    hubGroup.add(canopy);

    // Structural steel arch ribs
    const archMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    for (let rz = -11; rz <= 11; rz += 4.4) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(15, 0.25, 8, 32, Math.PI),
        archMat
      );
      arch.position.set(0, 10, rz);
      hubGroup.add(arch);
    }

    // Station Passenger Platform
    const platGeom = new THREE.BoxGeometry(16, 0.8, 24);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const platform = new THREE.Mesh(platGeom, platMat);
    platform.position.set(0, 0.4, 0);
    hubGroup.add(platform);

    this.group.add(hubGroup);
  }

  buildNightStreetlamps() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    this.streetlampMats.push(lampMat);

    const postGeom = new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8);
    const armGeom = new THREE.BoxGeometry(0.8, 0.08, 0.08);
    const headGeom = new THREE.BoxGeometry(0.35, 0.12, 0.22);

    [-11.5, 11.5].forEach(x => {
      for (let z = -35; z <= 85; z += 18) {
        const lamp = new THREE.Group();
        lamp.position.set(x, 0, z);

        const post = new THREE.Mesh(postGeom, postMat);
        post.position.y = 2.1;
        post.castShadow = true;
        lamp.add(post);

        const arm = new THREE.Mesh(armGeom, postMat);
        arm.position.set(x > 0 ? -0.4 : 0.4, 4.1, 0);
        lamp.add(arm);

        const head = new THREE.Mesh(headGeom, lampMat);
        head.position.set(x > 0 ? -0.8 : 0.8, 4.05, 0);
        lamp.add(head);

        // Ground glow spot
        const spotGeom = new THREE.CircleGeometry(1.6, 16);
        spotGeom.rotateX(-Math.PI / 2);
        const spotMat = new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.18,
          depthWrite: false
        });
        const spot = new THREE.Mesh(spotGeom, spotMat);
        spot.position.set(x > 0 ? -0.8 : 0.8, 0.03, 0);
        lamp.add(spot);

        this.group.add(lamp);
      }
    });
  }

  update(time, nightIntensity = 0) {
    // Animate holographic materials
    this.holograms.forEach(mat => {
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
    });

    // Modulate streetlamp glow with evening/night intensity (Major 4)
    if (this.streetlampMats) {
      this.streetlampMats.forEach(mat => {
        mat.emissiveIntensity = 0.4 + nightIntensity * 2.6;
      });
    }

    // Blink red aviation warning beacons at 1 Hz
    const beaconAlpha = Math.sin(time * 6.28) > 0.0 ? 1.0 : 0.15;
    this.beacons.forEach(b => {
      b.material.opacity = beaconAlpha;
    });
  }
}
