import * as THREE from 'three';
import { escapeHTML } from '../main.js';

/**
 * HolographicCodeIDESandbox (Major 5)
 * Floating in-game holographic runtime code IDE sandbox.
 * Allows users to write Three.js / JS snippets to spawn custom procedural geometries,
 * particle sculptures, and audio formants live inside Skillverse 3D.
 */
export class HolographicCodeIDESandbox {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.sandboxObjects = [];
    this.presets = {
      torus: `// 1. Quantum Cyber-Torus
const geom = new THREE.TorusGeometry(1.8, 0.25, 16, 64);
const mat = new THREE.MeshStandardMaterial({
  color: 0x00f0ff,
  metalness: 0.9,
  roughness: 0.1,
  wireframe: true
});
const mesh = new THREE.Mesh(geom, mat);
mesh.position.set(-1.0, 1.8, 54.3);
scene.add(mesh);`,
      particles: `// 2. Holographic Golden Orb
const geom = new THREE.IcosahedronGeometry(1.2, 2);
const mat = new THREE.MeshStandardMaterial({
  color: 0xfbbf24,
  metalness: 0.85,
  roughness: 0.15
});
const mesh = new THREE.Mesh(geom, mat);
mesh.position.set(-1.0, 1.8, 54.3);
scene.add(mesh);`,
      audioChirp: `// 3. Audio Synthesizer Beep
if (audioEngine && typeof audioEngine.speakRobotVocal === 'function') {
  audioEngine.speakRobotVocal('ai_ml');
}`
    };

    if (typeof document !== 'undefined') {
      this.initDOM();
    }
  }

  initDOM() {
    const existing = document.getElementById('code-ide-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'code-ide-modal';
    modal.className = 'customizer-backdrop';
    modal.innerHTML = `
      <div class="customizer-window" style="max-width: 680px;">
        <div class="customizer-header">
          <div class="customizer-title-group">
            <span class="customizer-icon">💻</span>
            <div>
              <div class="customizer-title">Holographic Runtime Code IDE Sandbox</div>
              <div class="customizer-subtitle">LIVE IN-GAME JAVASCRIPT & THREE.JS PROCEDURAL SCULPTING</div>
            </div>
          </div>
          <button class="customizer-close" id="btn-close-ide">✕</button>
        </div>

        <div class="customizer-body" style="display: flex; flex-direction: column; gap: 12px; padding: 16px;">
          <div style="display: flex; gap: 8px;">
            <button class="cust-btn active" id="btn-ide-preset-torus">Quantum Torus</button>
            <button class="cust-btn" id="btn-ide-preset-orb">Golden Orb</button>
            <button class="cust-btn" id="btn-ide-preset-audio">Synthesizer Chirp</button>
          </div>

          <textarea id="ide-editor-area" style="
            width: 100%;
            height: 220px;
            background: #090d16;
            color: #38bdf8;
            font-family: monospace;
            font-size: 12px;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(56, 189, 248, 0.3);
            resize: vertical;
            outline: none;
            box-sizing: border-box;
          ">${this.presets.torus}</textarea>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span id="ide-status-text" style="font-size: 11px; font-family: monospace; color: #94a3b8;">
              READY • Sandbox exposes { scene, THREE, audioEngine, app }
            </span>
            <div style="display: flex; gap: 8px;">
              <button class="cust-btn" id="btn-ide-clear" style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444;">Clear Objects</button>
              <button class="cust-btn active" id="btn-ide-run" style="background: rgba(16, 185, 129, 0.25); border-color: #10b981;">▶ Run Script</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('#btn-close-ide')?.addEventListener('click', () => this.close());
    modal.querySelector('#btn-ide-clear')?.addEventListener('click', () => this.clearObjects());
    modal.querySelector('#btn-ide-run')?.addEventListener('click', () => this.executeCurrent());

    modal.querySelector('#btn-ide-preset-torus')?.addEventListener('click', () => {
      this.setPreset('torus');
    });
    modal.querySelector('#btn-ide-preset-orb')?.addEventListener('click', () => {
      this.setPreset('particles');
    });
    modal.querySelector('#btn-ide-preset-audio')?.addEventListener('click', () => {
      this.setPreset('audioChirp');
    });
  }

  setPreset(name) {
    const textarea = document.getElementById('ide-editor-area');
    if (textarea && this.presets[name]) {
      textarea.value = this.presets[name];
    }
  }

  open() {
    this.isOpen = true;
    const modal = document.getElementById('code-ide-modal');
    if (modal) modal.classList.add('visible');
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById('code-ide-modal');
    if (modal) modal.classList.remove('visible');
  }

  clearObjects() {
    if (!this.app || !this.app.scene) return;
    this.sandboxObjects.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.app.scene.remove(obj);
    });
    this.sandboxObjects = [];
    const status = typeof document !== 'undefined' ? document.getElementById('ide-status-text') : null;
    if (status) status.textContent = 'CLEARED • All sandbox objects removed from scene';
  }

  executeCurrent() {
    const textarea = document.getElementById('ide-editor-area');
    if (!textarea) return;
    this.execute(textarea.value);
  }

  execute(codeStr) {
    const status = typeof document !== 'undefined' ? document.getElementById('ide-status-text') : null;
    try {
      const sceneProxy = {
        add: (obj) => {
          if (obj && this.app && this.app.scene) {
            this.app.scene.add(obj);
            this.sandboxObjects.push(obj);
          }
        },
        remove: (obj) => {
          if (obj && this.app && this.app.scene) {
            this.app.scene.remove(obj);
          }
        }
      };

      const fn = new Function('scene', 'THREE', 'audioEngine', 'app', codeStr);
      fn(sceneProxy, THREE, this.app.audioEngine, this.app);

      if (status) {
        status.style.color = '#10b981';
        status.textContent = 'SUCCESS • Script executed in sandbox';
      }
      if (this.app && typeof this.app.showToast === 'function') {
        this.app.showToast('✨ CODE IDE: Procedural geometry spawned successfully!');
      }
      return true;
    } catch (err) {
      if (status) {
        status.style.color = '#f43f5e';
        status.textContent = `ERROR: ${err.message}`;
      }
      return false;
    }
  }
}
