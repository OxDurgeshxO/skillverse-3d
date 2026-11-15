import * as THREE from 'three';

/**
 * GpuParticleSystem: 50,000+ GPU Particle System
 * Computes billboard particle trajectories entirely on GPU via custom vertex and fragment shaders.
 * Emitters: Cryogenic steam, welding sparks, mountain waterfall spray, quantum neural dust.
 */
export class GpuParticleSystem {
  constructor(scene, { count = 50000 } = {}) {
    this.scene = scene;
    this.count = count;
    this.geometry = null;
    this.material = null;
    this.pointsMesh = null;

    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);
    const emitterTypes = new Float32Array(this.count);
    const lifetimes = new Float32Array(this.count);
    const scales = new Float32Array(this.count);

    const emitterOrigins = [
      { x: 420, y: 15, z: -260 },  // 0: Space Launch Base (Steam)
      { x: 240, y: 12, z: -40 },   // 1: Harbor (Welding sparks)
      { x: -360, y: 45, z: -260 }, // 2: Adventure Mountains (Waterfall)
      { x: -240, y: 22, z: -160 }  // 3: AI Valley (Quantum neural dust)
    ];

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const type = i % 4;
      emitterTypes[i] = type;
      lifetimes[i] = Math.random();

      const o = emitterOrigins[type];
      const spread = (type === 0) ? 14 : (type === 1) ? 6 : (type === 2) ? 20 : 35;

      positions[i3] = o.x + (Math.random() - 0.5) * spread;
      positions[i3 + 1] = o.y + (Math.random() - 0.5) * 4;
      positions[i3 + 2] = o.z + (Math.random() - 0.5) * spread;

      if (type === 0) {
        // Steam: upward billowing
        velocities[i3] = (Math.random() - 0.5) * 4.0;
        velocities[i3 + 1] = 8.0 + Math.random() * 12.0;
        velocities[i3 + 2] = (Math.random() - 0.5) * 4.0;
        scales[i] = 4.5 + Math.random() * 3.5;
      } else if (type === 1) {
        // Welding sparks: high-speed arc burst
        velocities[i3] = (Math.random() - 0.5) * 16.0;
        velocities[i3 + 1] = 5.0 + Math.random() * 10.0;
        velocities[i3 + 2] = (Math.random() - 0.5) * 16.0;
        scales[i] = 2.0 + Math.random() * 2.0;
      } else if (type === 2) {
        // Waterfall mist: cascading downward
        velocities[i3] = (Math.random() - 0.5) * 5.0;
        velocities[i3 + 1] = -14.0 - Math.random() * 8.0;
        velocities[i3 + 2] = (Math.random() - 0.5) * 5.0;
        scales[i] = 3.5 + Math.random() * 2.5;
      } else {
        // Quantum neural dust: gentle floating turbulence
        velocities[i3] = (Math.random() - 0.5) * 3.0;
        velocities[i3 + 1] = (Math.random() - 0.5) * 3.0;
        velocities[i3 + 2] = (Math.random() - 0.5) * 3.0;
        scales[i] = 2.8 + Math.random() * 2.2;
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    this.geometry.setAttribute('emitterType', new THREE.BufferAttribute(emitterTypes, 1));
    this.geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    this.geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        attribute vec3 velocity;
        attribute float emitterType;
        attribute float lifetime;
        attribute float scale;
        varying float vType;
        varying float vAlpha;

        void main() {
          vType = emitterType;

          // Compute cyclic progression [0.0 - 1.0]
          float cycle = fract((uTime * 0.35) + lifetime);
          vAlpha = sin(cycle * 3.14159);

          vec3 pos = position + (velocity * cycle * 2.2);

          // Type 1 (sparks) experience gravity
          if (emitterType > 0.5 && emitterType < 1.5) {
            pos.y -= 18.0 * cycle * cycle;
          }

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Point size with perspective scale attenuation
          gl_PointSize = scale * (260.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying float vType;
        varying float vAlpha;

        void main() {
          // Circular particle mask with soft gaussian falloff
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distSq = dot(coord, coord);
          if (distSq > 0.25) discard;

          float falloff = exp(-distSq * 9.0) * vAlpha;

          vec3 col = vec3(1.0);
          if (vType < 0.5) {
            // Steam: White-cyan cloud
            col = mix(vec3(0.9, 0.95, 1.0), vec3(0.5, 0.85, 1.0), falloff);
          } else if (vType < 1.5) {
            // Welding sparks: High-energy golden amber & white hot
            col = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.95, 0.8), falloff);
          } else if (vType < 2.5) {
            // Waterfall spray: Cool turquoise azure
            col = vec3(0.3, 0.8, 0.95);
          } else {
            // Quantum neural dust: Violet & cyan quantum luminescence
            col = vec3(0.75, 0.45, 1.0);
          }

          gl_FragColor = vec4(col, falloff * 0.85);
        }
      `,
      uniforms: {
        uTime: { value: 0.0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.pointsMesh);
  }

  update(time) {
    if (this.material && this.material.uniforms) {
      this.material.uniforms.uTime.value = time;
    }
  }

  dispose() {
    if (this.pointsMesh) {
      this.scene.remove(this.pointsMesh);
      if (this.geometry) this.geometry.dispose();
      if (this.material) this.material.dispose();
      this.pointsMesh = null;
    }
  }
}
