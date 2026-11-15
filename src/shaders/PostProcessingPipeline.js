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

    // 4. Output Pass (Color space & tone mapping compliance)
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
  }

  setMacroFocus(focusY = 0.52, strength = 2.2) {
    if (this.isMock || !this.tiltShiftPass) return;
    this.tiltShiftPass.uniforms.focusPosition.value = focusY;
    this.tiltShiftPass.uniforms.blurStrength.value = strength;
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
