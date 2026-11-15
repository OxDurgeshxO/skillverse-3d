import * as THREE from 'three';

export class TransitNetwork {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.skycars = [];
    this.cars = [];
    this.trainCars = [];
    this.buildMaglevStation();
    this.buildPlanetaryInterZoneMonorail();
    this.buildMaglevTrain();
    this.buildGroundTraffic();
    this.buildSkyTraffic();
    this.buildPedestrianCrosswalkSignals();
    this.scene.add(this.group);
  }

  buildMaglevStation() {
    this.stationGroup = new THREE.Group();

    // Structural support pylons flanking boulevard at x = -14 and x = 14
    const pylonGeom = new THREE.BoxGeometry(2.4, 7.2, 3.2);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });
    const pylonL = new THREE.Mesh(pylonGeom, pylonMat);
    pylonL.position.set(-14, 3.6, 70);
    pylonL.castShadow = true;
    pylonL.receiveShadow = true;
    this.stationGroup.add(pylonL);

    const pylonR = new THREE.Mesh(pylonGeom, pylonMat);
    pylonR.position.set(14, 3.6, 70);
    pylonR.castShadow = true;
    pylonR.receiveShadow = true;
    this.stationGroup.add(pylonR);

    // Elevated station platform deck bridging across boulevard
    const deckGeom = new THREE.BoxGeometry(72, 0.9, 7.5);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.2
    });
    const deck = new THREE.Mesh(deckGeom, deckMat);
    deck.position.set(0, 6.7, 70);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.stationGroup.add(deck);

    // Translucent curved glass canopy covering station platform
    const canopyGeom = new THREE.CylinderGeometry(8, 8, 56, 32, 1, true, 0, Math.PI);
    canopyGeom.rotateZ(Math.PI / 2);
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.8,
      side: THREE.DoubleSide
    });
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 8.8, 70);
    this.stationGroup.add(canopy);

    // Glowing cyan maglev monorail guide beam
    const beamGeom = new THREE.BoxGeometry(160, 0.5, 0.7);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.set(0, 7.2, 70);
    this.stationGroup.add(beam);

    // Station holographic sign
    const signGeom = new THREE.PlaneGeometry(12, 1.4);
    const signMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const sign = new THREE.Mesh(signGeom, signMat);
    sign.position.set(0, 9.8, 66.2);
    this.stationGroup.add(sign);

    // Platform edge safety warning lights
    const edgeLightMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const edgeL = new THREE.Mesh(new THREE.BoxGeometry(50, 0.08, 0.15), edgeLightMat);
    edgeL.position.set(0, 7.18, 67.2);
    this.stationGroup.add(edgeL);

    this.group.add(this.stationGroup);
  }

  buildPlanetaryInterZoneMonorail() {
    this.monorailNetworkGroup = new THREE.Group();

    // Catmull-Rom spline path linking all 12 zones into continuous planetary loop
    const loopPoints = [
      new THREE.Vector3(0, 7.2, 70),       // Tech City Maglev Central Station
      new THREE.Vector3(70, 8.5, 20),      // Tech East Junction
      new THREE.Vector3(130, 8.0, 90),     // Medical Care City Corridor
      new THREE.Vector3(240, 6.5, -40),    // Engineering Harbor Docks
      new THREE.Vector3(340, 11.0, -180),  // Coastal Uplands & Ocean Approach
      new THREE.Vector3(420, 14.5, -260),  // Space Launch Base Gantry Terminal
      new THREE.Vector3(260, 12.0, -220),  // Northern Transit Viaduct
      new THREE.Vector3(80, 9.5, -120),    // Global Learning University Spire
      new THREE.Vector3(-80, 8.0, -70),    // Agricultural Junction
      new THREE.Vector3(-150, 7.0, -60),   // Green Agriculture Fields
      new THREE.Vector3(-240, 22.0, -160), // AI Research Valley High Ridge
      new THREE.Vector3(-180, 12.0, 40),   // Sports Arena Kinetic Pass
      new THREE.Vector3(-90, 8.0, 65),     // Creative Art District Gateway
      new THREE.Vector3(0, 7.2, 70)        // Returns to Tech City Central Station
    ];

    const railCurve = new THREE.CatmullRomCurve3(loopPoints, true, 'centripetal');

    // Continuous extruded tube geometry for planetary monorail guide beam
    const tubeGeom = new THREE.TubeGeometry(railCurve, 128, 0.35, 8, true);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, railMat);
    tubeMesh.castShadow = true;
    this.monorailNetworkGroup.add(tubeMesh);

    // Glowing cyan electromagnetic guide rail along top of beam
    const topRailGeom = new THREE.TubeGeometry(railCurve, 128, 0.12, 6, true);
    const glowRailMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const glowRail = new THREE.Mesh(topRailGeom, glowRailMat);
    this.monorailNetworkGroup.add(glowRail);

    // Concrete & titanium structural pylons grounded into terrain
    const pylonGeom = new THREE.BoxGeometry(1.2, 1, 1.2);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3
    });

    const numPylons = 28;
    for (let i = 0; i < numPylons; i++) {
      const u = i / numPylons;
      const point = railCurve.getPoint(u);
      const height = Math.max(point.y, 1.0);
      const pylon = new THREE.Mesh(pylonGeom, pylonMat);
      pylon.scale.set(1.2, height, 1.2);
      pylon.position.set(point.x, height / 2, point.z);
      pylon.castShadow = true;
      pylon.receiveShadow = true;
      this.monorailNetworkGroup.add(pylon);
    }

    this.group.add(this.monorailNetworkGroup);
  }

  buildMaglevTrain() {
    this.trainGroup = new THREE.Group();
    const trainMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.85,
      roughness: 0.15
    });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });

    for (let c = 0; c < 3; c++) {
      const carGroup = new THREE.Group();
      const carGeom = new THREE.BoxGeometry(14, 2.2, 2.8);
      const car = new THREE.Mesh(carGeom, trainMat);
      car.castShadow = true;
      carGroup.add(car);

      // Aerodynamic wedge nose on lead car (c === 2)
      if (c === 2) {
        const noseGeom = new THREE.ConeGeometry(1.6, 3.8, 4);
        noseGeom.rotateZ(-Math.PI / 2);
        noseGeom.rotateX(Math.PI / 4);
        const nose = new THREE.Mesh(noseGeom, noseMat);
        nose.position.x = 8.8;
        carGroup.add(nose);

        // Front headlight beam
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 1.2), glowMat);
        hl.position.set(10.6, 0, 0);
        carGroup.add(hl);
      }

      const winGeom = new THREE.BoxGeometry(13, 0.7, 2.9);
      const winMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
      const win = new THREE.Mesh(winGeom, winMat);
      win.position.y = 0.35;
      carGroup.add(win);

      // Underside electromagnetic levitation glow skirt
      const skirtGeom = new THREE.BoxGeometry(14.2, 0.3, 3.0);
      const skirt = new THREE.Mesh(skirtGeom, glowMat);
      skirt.position.y = -1.1;
      carGroup.add(skirt);

      carGroup.position.x = c * 15.2;
      this.trainGroup.add(carGroup);
      this.trainCars.push(carGroup);
    }

    // Elevated on station monorail beam at z = 70, y = 8.4
    this.trainGroup.position.set(-65, 8.4, 70);
    this.group.add(this.trainGroup);
  }

  buildGroundTraffic() {
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.2
    });

    for (let i = 0; i < 8; i++) {
      const car = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 4.8), carMat);
      body.position.y = 0.6;
      body.castShadow = true;
      car.add(body);

      const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

      const hl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.2), headlightMat);
      hl.position.set(0, 0.6, 2.4);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.2), taillightMat);
      tl.position.set(0, 0.6, -2.4);
      car.add(hl);
      car.add(tl);

      const laneX = (i % 2 === 0) ? -4.5 : 4.5;
      const baseSpeed = (i % 2 === 0) ? 18 : -18;
      car.position.set(laneX, 0.1, -50 + i * 22);
      this.group.add(car);
      this.cars.push({
        mesh: car,
        baseSpeed,
        currentSpeed: baseSpeed,
        laneX,
        headlightMat,
        taillightMat
      });
    }
  }

  buildPedestrianCrosswalkSignals() {
    // Smart Holographic Crosswalk Signal Bars at z = 55
    const barGeom = new THREE.BoxGeometry(16, 0.08, 1.5);
    this.crosswalkMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.75
    });
    const crosswalk = new THREE.Mesh(barGeom, this.crosswalkMat);
    crosswalk.position.set(0, 0.08, 55);
    this.group.add(crosswalk);
  }

  buildSkyTraffic() {
    const skycarMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.2
    });
    const navLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let s = 0; s < 10; s++) {
      const drone = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4), skycarMat);
      drone.add(body);

      for (let w = -1; w <= 1; w += 2) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 8, 16), navLightMat);
        ring.rotateX(Math.PI / 2);
        ring.position.set(w * 1.8, 0, 0);
        drone.add(ring);
      }

      const alt = 45 + (s % 3) * 20;
      const radius = 90 + s * 15;
      drone.position.set(Math.cos(s) * radius, alt, Math.sin(s) * radius);
      this.group.add(drone);
      this.skycars.push({ mesh: drone, alt, radius, speed: 0.4 + (s % 3) * 0.15, offset: s });
    }
  }

  update(delta, time, sequencerTime = -1) {
    if (this.trainGroup) {
      if (sequencerTime !== undefined && sequencerTime >= 0) {
        // Timeline-synchronized smooth glide into station platform
        // 0.0s to 5.0s: Gliding towards station from distance (x: -85 to -40)
        // 5.0s to 9.5s: Decelerating smoothly into station platform directly in front of explorer (x: -40 to -4)
        // 9.5s to 10.0s: Coming to a gentle stop at station center (x: -4 to 0)
        let targetX;
        if (sequencerTime < 5.0) {
          const tNorm = sequencerTime / 5.0;
          targetX = THREE.MathUtils.lerp(-85, -40, tNorm);
        } else if (sequencerTime < 9.5) {
          const tNorm = (sequencerTime - 5.0) / 4.5;
          const easeOut = 1 - Math.pow(1 - tNorm, 2.5);
          targetX = THREE.MathUtils.lerp(-40, -4, easeOut);
        } else {
          const tNorm = (sequencerTime - 9.5) / 0.5;
          targetX = THREE.MathUtils.lerp(-4, 0, tNorm);
        }
        this.trainGroup.position.x = targetX;
      } else {
        this.trainGroup.position.x += 18 * delta;
        if (this.trainGroup.position.x > 85) {
          this.trainGroup.position.x = -85;
        }
      }
    }

    // Autonomous Ground Traffic with Crosswalk Yielding
    const crosswalkZ = 55;
    const isPedestrianCrossing = Math.sin(time * 0.5) > 0.1; // Periodic pedestrian crossing window

    if (this.crosswalkMat) {
      if (isPedestrianCrossing) {
        this.crosswalkMat.color.setHex(0x10b981); // Green signal for walking robots
        this.crosswalkMat.opacity = 0.85 + Math.sin(time * 6.0) * 0.15;
      } else {
        this.crosswalkMat.color.setHex(0x0284c7);
        this.crosswalkMat.opacity = 0.35;
      }
    }

    this.cars.forEach(c => {
      const distToCrosswalk = Math.abs(c.mesh.position.z - crosswalkZ);
      const isApproaching = (c.baseSpeed > 0 && c.mesh.position.z < crosswalkZ && distToCrosswalk < 16) ||
                            (c.baseSpeed < 0 && c.mesh.position.z > crosswalkZ && distToCrosswalk < 16);

      if (isPedestrianCrossing && isApproaching) {
        // Yield and decelerate smoothly to zero
        c.currentSpeed = THREE.MathUtils.lerp(c.currentSpeed, 0, delta * 3.0);
        // Amber hazard blink
        c.headlightMat.color.setHex(Math.sin(time * 12.0) > 0 ? 0xf59e0b : 0xffffff);
      } else {
        // Accelerate back to cruising speed
        c.currentSpeed = THREE.MathUtils.lerp(c.currentSpeed, c.baseSpeed, delta * 2.0);
        c.headlightMat.color.setHex(0xffffff);
      }

      c.mesh.position.z += c.currentSpeed * delta;
      if (c.mesh.position.z > 95) c.mesh.position.z = -70;
      if (c.mesh.position.z < -70) c.mesh.position.z = 95;
    });

    this.skycars.forEach(s => {
      const angle = time * s.speed + s.offset;
      s.mesh.position.x = Math.cos(angle) * s.radius;
      s.mesh.position.z = Math.sin(angle) * s.radius;
      s.mesh.position.y = s.alt + Math.sin(time * 2.0 + s.offset) * 2;
      s.mesh.rotation.y = -angle + Math.PI / 2;
    });
  }
}
