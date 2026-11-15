import * as THREE from 'three';
import { RobotBuilder } from '../entities/RobotBuilder.js';
import { STL3DPrintExporter } from '../exporters/STL3DPrintExporter.js';
import { escapeHTML } from '../main.js';

/**
 * RobotCustomizerModal: 360° Interactive 3D Turntable Robot Customizer
 * Allows players to assemble custom skill humanoids, test rigs, and deploy them into the living world.
 */
export class RobotCustomizerModal {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.robotBuilder = new RobotBuilder();
    this.stlExporter = new STL3DPrintExporter();

    this.currentConfig = {
      name: 'Quantum Cybernetics Bot',
      primaryColor: '#00f0ff',
      headType: 'visor', // 'visor' | 'dome' | 'dual'
      rigType: 'keyboard', // 'keyboard' | 'jetpack' | 'drone' | 'torch'
      material: 'matte_ceramic',
      scale: 0.30
    };

    this.turntableScene = null;
    this.turntableCamera = null;
    this.turntableRenderer = null;
    this.previewRobotMesh = null;
    this.animFrameId = null;

    if (typeof document !== 'undefined') {
      this.initDOM();
    }
  }

  initDOM() {
    const existing = document.getElementById('customizer-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'customizer-modal';
    modal.className = 'customizer-backdrop';
    modal.innerHTML = `
      <div class="customizer-window">
        <div class="customizer-header">
          <div class="customizer-title-group">
            <span class="customizer-icon">⚙️</span>
            <div>
              <div class="customizer-title">3D Robot Builder & Rig Customizer</div>
              <div class="customizer-subtitle">DESIGN & DEPLOY EMBODIED SKILL HUMANOIDS (28-35 CM SCALE)</div>
            </div>
          </div>
          <button class="customizer-close" id="btn-close-customizer">✕</button>
        </div>

        <div class="customizer-body">
          <!-- 3D Turntable Canvas Preview -->
          <div class="turntable-panel">
            <canvas id="turntable-canvas" width="360" height="360"></canvas>
            <div class="turntable-hint">360° AUTO-TURNTABLE • SCALE 1:6 (30 CM)</div>
          </div>

          <!-- Configuration Controls Form -->
          <div class="customizer-controls">
            <div class="cust-group">
              <label class="cust-label">ROBOT SPECIES DESIGNATION</label>
              <input type="text" id="cust-robot-name" class="cust-input" value="Quantum Cybernetics Bot" maxlength="40" />
            </div>

            <div class="cust-group">
              <label class="cust-label">CHASSIS PRIMARY PBR COLOR</label>
              <div class="color-palette" id="cust-color-palette">
                <button class="palette-swatch active" data-color="#00f0ff" style="background: #00f0ff;"></button>
                <button class="palette-swatch" data-color="#c084fc" style="background: #c084fc;"></button>
                <button class="palette-swatch" data-color="#f59e0b" style="background: #f59e0b;"></button>
                <button class="palette-swatch" data-color="#10b981" style="background: #10b981;"></button>
                <button class="palette-swatch" data-color="#f43f5e" style="background: #f43f5e;"></button>
                <button class="palette-swatch" data-color="#38bdf8" style="background: #38bdf8;"></button>
                <button class="palette-swatch" data-color="#ffffff" style="background: #ffffff;"></button>
                <button class="palette-swatch" data-color="#1e293b" style="background: #1e293b;"></button>
              </div>
            </div>

            <div class="cust-group">
              <label class="cust-label">HEAD & SENSOR PROFILE</label>
              <div class="cust-btn-group" id="cust-head-group">
                <button class="cust-btn active" data-head="visor">Cyber Visor</button>
                <button class="cust-btn" data-head="dome">Neural Dome</button>
                <button class="cust-btn" data-head="dual">Dual Optics</button>
              </div>
            </div>

            <div class="cust-group">
              <label class="cust-label">SIGNATURE TOOL RIG ATTACHMENT</label>
              <div class="cust-btn-group" id="cust-rig-group">
                <button class="cust-btn active" data-rig="keyboard">Holo Keyboard</button>
                <button class="cust-btn" data-rig="jetpack">Micro Jetpack</button>
                <button class="cust-btn" data-rig="drone">Scout Drone</button>
                <button class="cust-btn" data-rig="torch">Welding Arc</button>
              </div>
            </div>

            <div class="customizer-actions">
              <button class="btn btn-primary" id="btn-deploy-custom" style="flex: 1.2; justify-content: center;">
                🚀 Deploy to World
              </button>
              <button class="btn" id="btn-stl-custom" style="flex: 1; justify-content: center; background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.5); color: #6ee7b7;">
                🖨 3D Print STL
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.bindEvents(modal);
  }

  bindEvents(modal) {
    document.getElementById('btn-close-customizer').addEventListener('click', () => this.close());
    
    // Close on clicking backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Color Swatches
    modal.querySelectorAll('.palette-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.palette-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentConfig.primaryColor = btn.dataset.color;
        this.rebuildPreviewRobot();
      });
    });

    // Head selector
    modal.querySelectorAll('#cust-head-group .cust-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('#cust-head-group .cust-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentConfig.headType = btn.dataset.head;
        this.rebuildPreviewRobot();
      });
    });

    // Rig selector
    modal.querySelectorAll('#cust-rig-group .cust-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('#cust-rig-group .cust-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentConfig.rigType = btn.dataset.rig;
        this.rebuildPreviewRobot();
      });
    });

    // Deploy Button
    document.getElementById('btn-deploy-custom').addEventListener('click', () => {
      this.deployToWorld();
    });

    // STL Export Button
    document.getElementById('btn-stl-custom').addEventListener('click', () => {
      if (this.previewRobotMesh) {
        const safeName = (document.getElementById('cust-robot-name')?.value || 'custom-robot')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        this.stlExporter.exportBinarySTL(this.previewRobotMesh, `${safeName}-28mm.stl`);
        if (this.app?.showToast) {
          this.app.showToast(`EXPORTED PHYSICAL 28MM TABLETOP STL: ${safeName}.stl`);
        }
      }
    });
  }

  initTurntableRenderer() {
    const canvas = document.getElementById('turntable-canvas');
    if (!canvas) return;

    this.turntableScene = new THREE.Scene();
    this.turntableScene.background = new THREE.Color(0x0b1329);

    this.turntableCamera = new THREE.PerspectiveCamera(40, 1.0, 0.05, 10);
    this.turntableCamera.position.set(0, 0.22, 0.72);
    this.turntableCamera.lookAt(0, 0.16, 0);

    // Studio lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 3, 2);
    this.turntableScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-2, 1, -2);
    this.turntableScene.add(rimLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.0);
    this.turntableScene.add(fillLight);

    // Circular pedestal disc
    const pedestalGeom = new THREE.CylinderGeometry(0.24, 0.26, 0.02, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = -0.01;
    this.turntableScene.add(pedestal);

    // Glowing rim on pedestal
    const ringGeom = new THREE.TorusGeometry(0.25, 0.005, 8, 32);
    ringGeom.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    this.turntableScene.add(ring);

    this.turntableRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.turntableRenderer.setSize(360, 360);
    this.turntableRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.rebuildPreviewRobot();
  }

  rebuildPreviewRobot() {
    if (!this.turntableScene) return;

    if (this.previewRobotMesh) {
      this.turntableScene.remove(this.previewRobotMesh);
      this.previewRobotMesh = null;
    }

    const colorInt = parseInt(this.currentConfig.primaryColor.replace('#', '0x'), 16);
    this.previewRobotMesh = this.robotBuilder.createSkillHumanoid({
      color: colorInt,
      eyeColor: 0x00ffff,
      scale: 0.30,
      detailPreset: 'high'
    });

    this.previewRobotMesh.position.set(0, 0, 0);
    this.turntableScene.add(this.previewRobotMesh);
  }

  animateTurntable() {
    if (!this.isOpen) return;

    this.animFrameId = requestAnimationFrame(() => this.animateTurntable());

    if (this.previewRobotMesh) {
      this.previewRobotMesh.rotation.y += 0.015;
    }

    if (this.turntableRenderer && this.turntableScene && this.turntableCamera) {
      this.turntableRenderer.render(this.turntableScene, this.turntableCamera);
    }
  }

  open() {
    this.isOpen = true;
    const modal = document.getElementById('customizer-modal');
    if (modal) modal.classList.add('visible');

    if (!this.turntableRenderer) {
      this.initTurntableRenderer();
    }
    this.animateTurntable();
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById('customizer-modal');
    if (modal) modal.classList.remove('visible');
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  deployToWorld() {
    if (!this.app || !this.app.scene) {
      this.close();
      return;
    }

    const nameInput = document.getElementById('cust-robot-name');
    const name = escapeHTML(nameInput?.value || 'Custom Companion Robot');
    const colorInt = parseInt(this.currentConfig.primaryColor.replace('#', '0x'), 16);

    const worldMesh = this.robotBuilder.createSkillHumanoid({
      color: colorInt,
      eyeColor: 0x00f0ff,
      scale: 0.30
    });

    // Deploy near explorer or tech city center
    const spawnPos = this.app.explorer?.mesh?.position
      ? { x: this.app.explorer.mesh.position.x + 0.8, y: 0.05, z: this.app.explorer.mesh.position.z + 0.8 }
      : { x: -8.0, y: 0.05, z: 54.0 };

    worldMesh.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
    this.app.scene.add(worldMesh);

    const entry = {
      id: `custom_${Date.now()}`,
      mesh: worldMesh,
      meta: {
        name,
        color: this.currentConfig.primaryColor,
        scale: '30 cm (0.30m)',
        zone: 'Custom Companion Deployed',
        material: 'Custom PBR Alloy',
        rig: `${this.currentConfig.rigType.toUpperCase()} RIG`,
        task: 'Autonomous planetary exploration and learning alongside Explorer'
      },
      isWalking: true,
      speed: 1.0
    };

    this.app.activeRobots.push(entry);
    this.close();

    if (this.app.showToast) {
      this.app.showToast(`DEPLOYED NEW HUMANOID: ${name.toUpperCase()} (30 CM)`);
    }
  }
}
