import * as THREE from 'three';

export class PlanetTerrain {
  constructor(scene) {
    this.scene = scene;
    this.radius = 800; // Planetary radius
    this.group = new THREE.Group();
    this.waterMesh = null;
    this.terrainMesh = null;
    this.initPlanetaryGlobe();
    this.initTerrain();
    this.initWater();
    this.initAtmosphericGlow();
    this.scene.add(this.group);
  }

  initPlanetaryGlobe() {
    // Solid planetary mantle sphere beneath terrain curvature to eliminate sharp void cutouts
    const globeGeom = new THREE.SphereGeometry(this.radius - 2.0, 64, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x091828, // Deep oceanic / basalt planetary crust
      roughness: 0.85,
      metalness: 0.15
    });
    this.globeMesh = new THREE.Mesh(globeGeom, globeMat);
    this.globeMesh.position.set(0, -this.radius, 0);
    this.globeMesh.receiveShadow = true;
    this.group.add(this.globeMesh);
  }

  initTerrain() {
    // High-density plane mapped to planet curvature
    const segments = 160;
    const size = 1600;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Curvature calculation: y drops off with distance from center
      const distFromCenter = Math.sqrt(x * x + z * z);
      const curvatureDrop = (distFromCenter * distFromCenter) / (2 * this.radius);

      // Procedural biome elevation
      let elevation = 0;

      // Mountain Zone: (x: -500 to -200, z: -400 to -100)
      const distMountain = Math.hypot(x - (-350), z - (-250));
      if (distMountain < 300) {
        elevation += Math.cos((distMountain / 300) * (Math.PI / 2)) * 120;
        elevation += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 20;
      }

      // Ocean Basin: (x: 200 to 700, z: 100 to 600)
      const distOcean = Math.hypot(x - 450, z - 350);
      if (distOcean < 400) {
        const oceanTrough = Math.cos((distOcean / 400) * (Math.PI / 2)) * 45;
        elevation -= oceanTrough;
      }

      // Tech City Foundation: Flat plateau around (0, 0)
      const distCity = Math.hypot(x, z);
      if (distCity < 250) {
        elevation = Math.sin(distCity * 0.01) * 2; // Flat urban shelf
      }

      // Space Launch Base: (x: 550, z: -350)
      const distSpace = Math.hypot(x - 550, z - (-350));
      if (distSpace < 180) {
        elevation = 4; // Flat coastal pad
      }

      pos.setY(i, elevation - curvatureDrop);
    }

    geometry.computeVertexNormals();

    // Biome vertex colors
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);

      if (y < -15) {
        // Deep coast / sand
        colors.push(0.85, 0.76, 0.58);
      } else if (x < -200 && z < -100) {
        // Alpine rock & forest
        if (y > 40) {
          colors.push(0.45, 0.48, 0.52); // Granite peak
        } else {
          colors.push(0.18, 0.32, 0.16); // Pine forest
        }
      } else if (x > 200 && z < -150) {
        // Industrial concrete harbor / spaceport
        colors.push(0.35, 0.38, 0.42);
      } else if (Math.hypot(x, z) < 220) {
        // Tech City Dark Asphalt / Glass Grid
        colors.push(0.12, 0.14, 0.18);
      } else {
        // Fertile plains / Agriculture
        colors.push(0.24, 0.42, 0.22);
      }
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: false
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
    this.group.add(this.terrainMesh);
  }

  initWater() {
    // Ocean plane with curved perimeter
    const waterGeom = new THREE.PlaneGeometry(1600, 1600, 64, 64);
    waterGeom.rotateX(-Math.PI / 2);

    const pos = waterGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      const curve = (dist * dist) / (2 * this.radius);
      pos.setY(i, -8 - curve);
    }
    waterGeom.computeVertexNormals();

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a4b75,
      emissive: 0x021626,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.65,
      ior: 1.333,
      transparent: true,
      opacity: 0.88,
      reflectivity: 0.9
    });

    this.waterMesh = new THREE.Mesh(waterGeom, waterMat);
    this.group.add(this.waterMesh);
  }

  initAtmosphericGlow() {
    // Atmospheric envelope sphere
    const glowGeom = new THREE.SphereGeometry(this.radius + 300, 48, 48);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - max(0.0, dot(vNormal, V));
          rim = pow(rim, 3.5);
          vec3 glowColor = mix(vec3(0.2, 0.5, 0.9), vec3(0.95, 0.6, 0.3), rim * 0.5);
          gl_FragColor = vec4(glowColor, rim * 0.45);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    glowMesh.position.y = -this.radius + 50;
    this.group.add(glowMesh);
  }

  update(time) {
    if (this.waterMesh) {
      const pos = this.waterMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const wave = Math.sin(x * 0.05 + time * 2.0) * Math.cos(z * 0.05 + time * 1.5) * 1.2;
        const dist = Math.sqrt(x * x + z * z);
        const curve = (dist * dist) / (2 * this.radius);
        pos.setY(i, -8 + wave - curve);
      }
      this.waterMesh.geometry.computeVertexNormals();
      this.waterMesh.geometry.attributes.position.needsUpdate = true;
    }
  }
}
