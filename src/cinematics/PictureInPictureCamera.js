import * as THREE from 'three';

/**
 * PictureInPictureCamera: Multi-Perspective Secondary FPV Camera HUD
 * Provides switchable feeds: Scout Drone FPV, Maglev front cab, and Orbital Launch Tower
 */
export class PictureInPictureCamera {
  constructor({ width = 280, height = 158 } = {}) {
    this.width = width;
    this.height = height;
    this.activeMode = 'drone'; // 'drone' | 'maglev' | 'tower'
    this.enabled = true;

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1500);
    this.camera.position.set(0, 10, 0);

    this.renderTarget = null;
    this.targetCanvas = null;
    this.targetCtx = null;
    this.pixelBuffer = null;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.initRenderTarget();
      this.initDOM();
    }
  }

  initRenderTarget() {
    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });
    this.pixelBuffer = new Uint8Array(this.width * this.height * 4);
  }

  initDOM() {
    const existing = document.getElementById('pip-container');
    if (existing) existing.remove();

    const pipContainer = document.createElement('div');
    pipContainer.id = 'pip-container';
    pipContainer.className = 'pip-hud-card';
    pipContainer.innerHTML = `
      <div class="pip-header">
        <div class="pip-title-wrap">
          <span class="pip-dot"></span>
          <span class="pip-title">CAM-02: <span id="pip-mode-label">DRONE FPV</span></span>
        </div>
        <div class="pip-mode-pills">
          <button class="pip-pill active" data-mode="drone">Drone</button>
          <button class="pip-pill" data-mode="maglev">Maglev</button>
          <button class="pip-pill" data-mode="tower">Launch</button>
        </div>
      </div>
      <div class="pip-viewport">
        <canvas id="pip-canvas" width="${this.width}" height="${this.height}"></canvas>
      </div>
    `;
    document.body.appendChild(pipContainer);

    this.targetCanvas = document.getElementById('pip-canvas');
    if (this.targetCanvas) {
      this.targetCtx = this.targetCanvas.getContext('2d');
    }

    pipContainer.querySelectorAll('.pip-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        pipContainer.querySelectorAll('.pip-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });
  }

  setMode(mode) {
    this.activeMode = mode;
    if (typeof document === 'undefined') return;
    const label = document.getElementById('pip-mode-label');
    if (label) {
      if (mode === 'drone') label.textContent = 'DRONE FPV';
      if (mode === 'maglev') label.textContent = 'MAGLEV FRONT CAB';
      if (mode === 'tower') label.textContent = 'LAUNCH TOWER';
    }
  }

  update(delta, time, { drone = null, transit = null } = {}) {
    if (this.activeMode === 'drone') {
      if (drone) {
        this.camera.position.set(drone.position.x, drone.position.y + 0.1, drone.position.z);
        // Look ahead and slightly down toward the street
        this.camera.lookAt(drone.position.x - 2, drone.position.y - 0.8, drone.position.z + 5);
      } else {
        // Floating drone patrol orbit
        const rad = 25;
        this.camera.position.set(Math.cos(time * 0.4) * rad, 12, Math.sin(time * 0.4) * rad + 40);
        this.camera.lookAt(0, 2, 50);
      }
    } else if (this.activeMode === 'maglev') {
      if (transit && transit.trackSpline) {
        const u = ((time * 0.08) % 1.0);
        const pt = transit.trackSpline.getPointAt(u);
        const tangent = transit.trackSpline.getTangentAt(u);
        this.camera.position.set(pt.x, pt.y + 1.2, pt.z);
        this.camera.lookAt(pt.x + tangent.x * 20, pt.y + tangent.y * 20, pt.z + tangent.z * 20);
      } else {
        this.camera.position.set(0, 18, 45);
        this.camera.lookAt(0, 15, 120);
      }
    } else if (this.activeMode === 'tower') {
      // Space Launch Base Gantry view
      this.camera.position.set(410, 85, -240);
      this.camera.lookAt(420, 25, -260);
    }
  }

  render(renderer, scene) {
    if (!this.enabled || !renderer || !scene) return;

    if (this.renderTarget && renderer.readRenderTargetPixels && this.targetCtx) {
      const currentRT = renderer.getRenderTarget();
      renderer.setRenderTarget(this.renderTarget);
      renderer.render(scene, this.camera);
      renderer.setRenderTarget(currentRT);

      renderer.readRenderTargetPixels(
        this.renderTarget,
        0, 0, this.width, this.height,
        this.pixelBuffer
      );

      // Invert vertical flip from WebGL bottom-to-top coordinates
      const imgData = this.targetCtx.createImageData(this.width, this.height);
      const data = imgData.data;
      const rowSize = this.width * 4;

      for (let y = 0; y < this.height; y++) {
        const srcY = this.height - 1 - y;
        const srcOffset = srcY * rowSize;
        const dstOffset = y * rowSize;
        data.set(this.pixelBuffer.subarray(srcOffset, srcOffset + rowSize), dstOffset);
      }

      this.targetCtx.putImageData(imgData, 0, 0);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (typeof document !== 'undefined') {
      const container = document.getElementById('pip-container');
      if (container) {
        container.style.display = this.enabled ? 'block' : 'none';
      }
    }
    return this.enabled;
  }
}
