import * as THREE from 'three';

/**
 * Verlet Integration Cloth Simulation Engine (Major 2)
 * Simulates physical mass-spring banners and flags fluttering dynamically
 * under wind vectors modulated by the planetary WeatherEngine.
 */
export class ClothSimulation {
  constructor({
    width = 6.0,
    height = 10.0,
    segmentsX = 8,
    segmentsY = 12,
    gravity = -9.8,
    damping = 0.98
  } = {}) {
    this.width = width;
    this.height = height;
    this.segmentsX = segmentsX;
    this.segmentsY = segmentsY;
    this.gravity = gravity;
    this.damping = damping;

    this.particles = [];
    this.constraints = [];
    this.pinned = [];

    this.initParticles();
    this.initConstraints();
    this.initGeometry();
  }

  initParticles() {
    this.particles = [];
    const dx = this.width / this.segmentsX;
    const dy = this.height / this.segmentsY;

    for (let y = 0; y <= this.segmentsY; y++) {
      for (let x = 0; x <= this.segmentsX; x++) {
        const px = x * dx - this.width / 2;
        const py = -y * dy;
        const pz = 0;

        const particle = {
          pos: new THREE.Vector3(px, py, pz),
          prevPos: new THREE.Vector3(px, py, pz),
          acc: new THREE.Vector3(0, 0, 0),
          invMass: (y === 0) ? 0 : 1.0 // Pinned top edge
        };

        this.particles.push(particle);
        if (y === 0) {
          this.pinned.push(this.particles.length - 1);
        }
      }
    }
  }

  initConstraints() {
    this.constraints = [];
    const stride = this.segmentsX + 1;

    for (let y = 0; y <= this.segmentsY; y++) {
      for (let x = 0; x <= this.segmentsX; x++) {
        const idx = y * stride + x;

        // Horizontal constraint
        if (x < this.segmentsX) {
          const rightIdx = idx + 1;
          const dist = this.particles[idx].pos.distanceTo(this.particles[rightIdx].pos);
          this.constraints.push({ p1: idx, p2: rightIdx, restDistance: dist });
        }

        // Vertical constraint
        if (y < this.segmentsY) {
          const downIdx = idx + stride;
          const dist = this.particles[idx].pos.distanceTo(this.particles[downIdx].pos);
          this.constraints.push({ p1: idx, p2: downIdx, restDistance: dist });
        }
      }
    }
  }

  initGeometry() {
    this.geometry = new THREE.BufferGeometry();
    const stride = this.segmentsX + 1;
    const vertexCount = this.particles.length;
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = [];

    let pIdx = 0;
    let uvIdx = 0;
    for (let y = 0; y <= this.segmentsY; y++) {
      for (let x = 0; x <= this.segmentsX; x++) {
        const p = this.particles[y * stride + x].pos;
        positions[pIdx++] = p.x;
        positions[pIdx++] = p.y;
        positions[pIdx++] = p.z;

        uvs[uvIdx++] = x / this.segmentsX;
        uvs[uvIdx++] = y / this.segmentsY;

        if (x < this.segmentsX && y < this.segmentsY) {
          const a = y * stride + x;
          const b = y * stride + (x + 1);
          const c = (y + 1) * stride + x;
          const d = (y + 1) * stride + (x + 1);

          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    this.geometry.setIndex(indices);
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  update(delta = 0.016, windVector = { x: 4.0, y: 0.5, z: 2.5 }) {
    const dt = Math.min(delta, 0.033);
    const dtSq = dt * dt;

    // 1. Accumulate external forces (gravity + wind with Perlin-style flutter)
    const timeSec = typeof performance !== 'undefined' ? performance.now() * 0.003 : Date.now() * 0.003;
    const flutter = Math.sin(timeSec * 4.0) * 0.4 + Math.cos(timeSec * 2.5) * 0.2;

    this.particles.forEach((p, idx) => {
      if (p.invMass === 0) return; // Pinned node

      p.acc.set(
        windVector.x * (1.0 + flutter),
        this.gravity + windVector.y,
        windVector.z * (1.0 + flutter * 0.8)
      );

      // Verlet Integration step: x_next = x + (x - x_prev) * damping + a * dt^2
      const tempX = p.pos.x;
      const tempY = p.pos.y;
      const tempZ = p.pos.z;

      p.pos.x += (p.pos.x - p.prevPos.x) * this.damping + p.acc.x * dtSq;
      p.pos.y += (p.pos.y - p.prevPos.y) * this.damping + p.acc.y * dtSq;
      p.pos.z += (p.pos.z - p.prevPos.z) * this.damping + p.acc.z * dtSq;

      p.prevPos.set(tempX, tempY, tempZ);
    });

    // 2. Relax distance constraints (3 relaxation solver passes)
    const deltaVec = new THREE.Vector3();
    for (let iter = 0; iter < 3; iter++) {
      this.constraints.forEach((c) => {
        const p1 = this.particles[c.p1];
        const p2 = this.particles[c.p2];

        deltaVec.subVectors(p2.pos, p1.pos);
        const currentDist = deltaVec.length();
        if (currentDist === 0) return;

        const diff = (currentDist - c.restDistance) / currentDist;
        const totalInvMass = p1.invMass + p2.invMass;
        if (totalInvMass === 0) return;

        const factor1 = p1.invMass / totalInvMass;
        const factor2 = p2.invMass / totalInvMass;

        if (p1.invMass > 0) {
          p1.pos.addScaledVector(deltaVec, diff * factor1);
        }
        if (p2.invMass > 0) {
          p2.pos.addScaledVector(deltaVec, -diff * factor2);
        }
      });
    }

    // 3. Update mesh vertex buffer
    const posAttr = this.geometry.attributes.position;
    if (posAttr) {
      this.particles.forEach((p, idx) => {
        posAttr.setXYZ(idx, p.pos.x, p.pos.y, p.pos.z);
      });
      posAttr.needsUpdate = true;
      this.geometry.computeVertexNormals();
    }
  }
}
