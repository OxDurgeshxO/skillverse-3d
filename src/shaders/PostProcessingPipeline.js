import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * Tilt-Shift Miniature Macro Lens Shader
 * Blurs top and bottom regions to simulate a macro photography shallow depth-of-field,
 * emphasizing the 30cm toy/collectible scale of the world.
 */
export const TiltShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    focusPosition: { value: 0.52 }, // Center vertical focus line [0, 1]
    focusBandWidth: { value: 0.22 }, // Width of crystal-sharp zone
    blurStrength: { value: 2.2 },   // Peripheral blur intensity
    resolution: { value: new THREE.Vector2(typeof window !== 'undefined' ? window.innerWidth : 1920, typeof window !== 'undefined' ? window.innerHeight : 1080) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float focusPosition;
    uniform float focusBandWidth;
    uniform float blurStrength;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
      float dist = abs(vUv.y - focusPosition);
      float blurFactor = smoothstep(focusBandWidth * 0.5, focusBandWidth * 1.8, dist);

      if (blurFactor <= 0.02) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      vec4 sum = vec4(0.0);
      vec2 texel = (1.0 / resolution) * blurStrength * blurFactor;

      // 9-tap progressive Gaussian kernel
      sum += texture2D(tDiffuse, vUv + vec2(-texel.x, -texel.y)) * 0.075;
      sum += texture2D(tDiffuse, vUv + vec2(0.0, -texel.y)) * 0.125;
      sum += texture2D(tDiffuse, vUv + vec2(texel.x, -texel.y)) * 0.075;

      sum += texture2D(tDiffuse, vUv + vec2(-texel.x, 0.0)) * 0.125;
      sum += texture2D(tDiffuse, vUv) * 0.200;
      sum += texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)) * 0.125;

      sum += texture2D(tDiffuse, vUv + vec2(-texel.x, texel.y)) * 0.075;
      sum += texture2D(tDiffuse, vUv + vec2(0.0, texel.y)) * 0.125;
      sum += texture2D(tDiffuse, vUv + vec2(texel.x, texel.y)) * 0.075;

      gl_FragColor = sum;
    }
  `
};

/**
 * Lens Condensation & Rain Droplet Refraction Shader
 * Simulates microscopic dynamic condensation and optical droplet refraction on the 24mm camera lens
 * during high-altitude cloud descent (0–4s) and rainy weather conditions.
 */
export const LensCondensationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRainIntensity: { value: 0.0 }, // [0.0 - 1.0]
    uTime: { value: 0.0 },
    resolution: { value: new THREE.Vector2(typeof window !== 'undefined' ? window.innerWidth : 1920, typeof window !== 'undefined' ? window.innerHeight : 1080) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uRainIntensity;
    uniform float uTime;
    uniform vec2 resolution;
    varying vec2 vUv;

    // Pseudo-random hash for droplet distribution
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      if (uRainIntensity <= 0.005) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
      vec2 uvGrid = vUv * aspect * 18.0;
      vec2 cellId = floor(uvGrid);
      vec2 cellUv = fract(uvGrid) - 0.5;

      float rand = hash(cellId);
      float dropMask = 0.0;
      vec2 distortion = vec2(0.0);

      // Random droplets populate ~35% of lens cells
      if (rand > 0.65) {
        float r = 0.28 * (rand * 0.5 + 0.5);
        float d = length(cellUv);
        if (d < r) {
          dropMask = smoothstep(r, r * 0.2, d);
          // Refractive convex normal vector pointing outward from droplet center
          distortion = normalize(cellUv) * dropMask * 0.045 * uRainIntensity;
        }
      }

      // Soft vertical rain streaks running down lens
      float streak = sin(vUv.x * 45.0 + hash(vec2(cellId.x, 1.0)) * 10.0);
      float streakMask = smoothstep(0.96, 1.0, streak) * uRainIntensity * 0.015;
      distortion.y -= streakMask;

      vec2 refractedUv = vUv - distortion;

      // Prismatic chromatic aberration at droplet meniscus rims
      float rColor = texture2D(tDiffuse, refractedUv + distortion * 0.15).r;
      float gColor = texture2D(tDiffuse, refractedUv).g;
      float bColor = texture2D(tDiffuse, refractedUv - distortion * 0.15).b;

      // Subtle condensation misty vignette around droplet edges
      vec3 finalColor = vec3(rColor, gColor, bColor);
      finalColor += vec3(0.08, 0.12, 0.15) * dropMask * uRainIntensity;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export class PostProcessingPipeline {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.bloomEnabled = true;
    this.tiltShiftEnabled = true;

    if (typeof window === 'undefined' || !renderer) {
      this.isMock = true;
      return;
    }

    this.initComposer();
  }

  initComposer() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.composer = new EffectComposer(this.renderer);

    // 1. Scene Render Pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 2. Sci-Fi Unreal Bloom Pass (subtle radiant glow on emissives & window lights)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.55,  // strength
      0.35,  // radius
      0.82   // threshold (only illuminates intense emissive surfaces)
    );
    this.composer.addPass(this.bloomPass);

    // 3. Miniature Macro Tilt-Shift Pass
    this.tiltShiftPass = new ShaderPass(TiltShiftShader);
    this.tiltShiftPass.uniforms.resolution.value.set(width, height);
    this.composer.addPass(this.tiltShiftPass);

    // 4. Optical Lens Condensation & Droplet Refraction Pass
    this.lensCondensationPass = new ShaderPass(LensCondensationShader);
    this.lensCondensationPass.uniforms.resolution.value.set(width, height);
    this.composer.addPass(this.lensCondensationPass);

    // 5. Output Pass (Color space & tone mapping compliance)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  setSize(width, height) {
    if (this.isMock || !this.composer) return;
    this.composer.setSize(width, height);
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
    if (this.tiltShiftPass && this.tiltShiftPass.uniforms.resolution) {
      this.tiltShiftPass.uniforms.resolution.value.set(width, height);
    }
    if (this.lensCondensationPass && this.lensCondensationPass.uniforms.resolution) {
      this.lensCondensationPass.uniforms.resolution.value.set(width, height);
    }
  }

  setMacroFocus(focusY = 0.52, strength = 2.2) {
    if (this.isMock || !this.tiltShiftPass) return;
    this.tiltShiftPass.uniforms.focusPosition.value = focusY;
    this.tiltShiftPass.uniforms.blurStrength.value = strength;
  }

  setRainIntensity(intensity = 0.0, time = 0.0) {
    if (this.isMock || !this.lensCondensationPass) return;
    this.lensCondensationPass.uniforms.uRainIntensity.value = intensity;
    this.lensCondensationPass.uniforms.uTime.value = time;
  }

  reinit() {
    if (this.isMock || !this.renderer) return;
    this.dispose();
    this.initComposer();
  }

  render() {
    if (this.isMock || !this.enabled || !this.composer) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.composer.render();
  }

  dispose() {
    if (this.isMock) return;
    if (this.composer) {
      this.composer.passes.forEach(p => {
        if (p.dispose) p.dispose();
      });
    }
  }
}
