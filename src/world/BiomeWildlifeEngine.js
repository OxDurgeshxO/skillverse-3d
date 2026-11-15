import * as THREE from 'three';

/**
 * Biome Wildlife Engine (Medium 5)
 * Simulates micro-ecosystems across planet biomes:
 * - Bioluminescent ocean fish schools (Ocean Exploration Coast)
 * - Soaring mountain raptors (Adventure Mountains)
 * - Autonomous cyber-bee pollinators (Green Agriculture Fields)
 */
export class BiomeWildlifeEngine {
  constructor(scene) {
    this.scene = scene;
    this.wildlifeGroup = new THREE.Group();
    this.wildlifeGroup.name = 'biome_wildlife';
    if (this.scene) this.scene.add(this.wildlifeGroup);

    this.initOceanFish();
    this.initMountainEagle();
    this.initCyberBees();
  }

  initOceanFish() {
    // School of 60 bioluminescent fish around offshore research rig (x: 220, z: -120, y: -0.5)
    const count = 60;
    const fishGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.fishInitialAngles = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 8.0 + (i % 6) * 2.2;
      this.fishInitialAngles[i] = angle;

      positions[i * 3] = 220 + Math.cos(angle) * radius;
      positions[i * 3 + 1] = -0.4 + Math.sin(i) * 0.3;
      positions[i * 3 + 2] = -120 + Math.sin(angle) * radius;

      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.85;
      colors[i * 3 + 2] = 1.0;
    }

    fishGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fishGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const fishMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.fishPoints = new THREE.Points(fishGeo, fishMat);
    this.wildlifeGroup.add(this.fishPoints);
  }

  initMountainEagle() {
    // Soaring mountain raptor circling Adventure Mountains (x: -260, z: 180, altitude y: 140)
    const eagleGroup = new THREE.Group();
    const wingGeo = new THREE.BoxGeometry(2.4, 0.04, 0.6);
    const bodyGeo = new THREE.ConeGeometry(0.2, 0.9, 5);
    bodyGeo.rotateX(Math.PI / 2);

    const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, mat);
    const wingL = new THREE.Mesh(wingGeo, mat);
    wingL.position.x = -1.2;
    const wingR = new THREE.Mesh(wingGeo, mat);
    wingR.position.x = 1.2;

    eagleGroup.add(body);
    eagleGroup.add(wingL);
    eagleGroup.add(wingR);
    eagleGroup.position.set(-260, 140, 180);

    this.eagle = eagleGroup;
    this.eagleWingL = wingL;
    this.eagleWingR = wingR;
    this.wildlifeGroup.add(eagleGroup);
  }

  initCyberBees() {
    // 35 Pollinator cyber-bees around vertical aeroponic towers (x: -160, z: -220, y: 12)
    const count = 35;
    const beeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.beeOffsets = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * 16.0;
      const oy = Math.random() * 8.0;
      const oz = (Math.random() - 0.5) * 16.0;

      this.beeOffsets[i * 3] = ox;
      this.beeOffsets[i * 3 + 1] = oy;
      this.beeOffsets[i * 3 + 2] = oz;

      positions[i * 3] = -160 + ox;
      positions[i * 3 + 1] = 10 + oy;
      positions[i * 3 + 2] = -220 + oz;
    }

    beeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const beeMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.22,
      transparent: true,
      opacity: 0.9
    });

    this.beePoints = new THREE.Points(beeGeo, beeMat);
    this.wildlifeGroup.add(this.beePoints);
  }

  update(delta = 0.016, time = 0) {
    // 1. Swirl ocean fish
    if (this.fishPoints && this.fishPoints.geometry) {
      const posAttr = this.fishPoints.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const radius = 8.0 + (i % 6) * 2.2;
        const currentAngle = this.fishInitialAngles[i] + time * 0.45;
        posAttr.setX(i, 220 + Math.cos(currentAngle) * radius);
        posAttr.setY(i, -0.4 + Math.sin(time * 2.0 + i) * 0.25);
        posAttr.setZ(i, -120 + Math.sin(currentAngle) * radius);
      }
      posAttr.needsUpdate = true;
    }

    // 2. Eagle soaring glide
    if (this.eagle) {
      const eagleRadius = 38.0;
      const eagleAngle = time * 0.35;
      this.eagle.position.x = -260 + Math.cos(eagleAngle) * eagleRadius;
      this.eagle.position.z = 180 + Math.sin(eagleAngle) * eagleRadius;
      this.eagle.position.y = 140 + Math.sin(time * 0.5) * 4.0;
      this.eagle.rotation.y = -eagleAngle - Math.PI / 2;

      // Gentle wing flap
      const flap = Math.sin(time * 3.5) * 0.12;
      if (this.eagleWingL) this.eagleWingL.rotation.z = flap;
      if (this.eagleWingR) this.eagleWingR.rotation.z = -flap;
    }

    // 3. Cyber-bees jitter pollinating motion
    if (this.beePoints && this.beePoints.geometry) {
      const posAttr = this.beePoints.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const ox = this.beeOffsets[i * 3];
        const oy = this.beeOffsets[i * 3 + 1];
        const oz = this.beeOffsets[i * 3 + 2];

        const jx = Math.sin(time * 8.0 + i * 1.5) * 0.8;
        const jy = Math.cos(time * 6.0 + i) * 0.6;
        const jz = Math.sin(time * 7.0 + i * 2.0) * 0.8;

        posAttr.setXYZ(i, -160 + ox + jx, 10 + oy + jy, -220 + oz + jz);
      }
      posAttr.needsUpdate = true;
    }
  }

  dispose() {
    if (this.scene && this.wildlifeGroup) {
      this.scene.remove(this.wildlifeGroup);
    }
    if (this.fishPoints?.geometry) this.fishPoints.geometry.dispose();
    if (this.beePoints?.geometry) this.beePoints.geometry.dispose();
  }
}
