/**
 * HolographicRadar: 3D Miniature Holographic Globe GPS Radar HUD
 * Projects planet geography, explorer location, and robot blips onto a rotating wireframe sphere.
 * Uses lightweight orthographic 2D canvas projection to guarantee 60 FPS without consuming WebGL contexts.
 */
export class HolographicRadar {
  constructor({ containerId = 'radar-container', size = 110, planetRadius = 400 } = {}) {
    this.size = size;
    this.radius = (size / 2) - 8;
    this.planetRadius = planetRadius;
    this.rotationAngle = 0;
    this.blips = [];
    this.explorerPos = { x: 0, y: 0, z: 50 };
    this.discoveredZones = new Set(['Tech City']);
    this.zones = [
      { name: 'Tech City', x: 0, z: 20, color: '#38bdf8' },
      { name: 'AI Valley', x: -240, z: -160, color: '#c084fc' },
      { name: 'Harbor', x: 240, z: -40, color: '#34d399' },
      { name: 'Space Base', x: 420, z: -260, color: '#fbbf24' },
      { name: 'Mountains', x: -360, z: -260, color: '#f87171' },
      { name: 'Art District', x: -120, z: 120, color: '#ec4899' },
      { name: 'Medical City', x: 120, z: 160, color: '#10b981' },
      { name: 'Agriculture', x: -160, z: -220, color: '#eab308' },
      { name: 'Ocean Coast', x: 220, z: -120, color: '#06b6d4' },
      { name: 'Ancient Ruins', x: -80, z: 320, color: '#d97706' },
      { name: 'Sports Arena', x: 300, z: 180, color: '#f43f5e' },
      { name: 'University', x: -40, z: -320, color: '#8b5cf6' }
    ];

    this.canvas = null;
    this.ctx = null;
    this.container = null;

    if (typeof document !== 'undefined') {
      this.initDOM(containerId);
    }
  }

  initDOM(containerId) {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'radar-hud-card';
      document.body.appendChild(container);
    }
    this.container = container;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.className = 'radar-canvas';
    this.ctx = this.canvas.getContext('2d');

    this.container.innerHTML = `
      <div class="radar-header">
        <span class="radar-title">🛰 GPS RADAR</span>
        <span class="radar-status">LIVE</span>
      </div>
    `;
    this.container.appendChild(this.canvas);
  }

  update(delta, explorerPos = null, robots = []) {
    this.rotationAngle += delta * 0.35;
    if (explorerPos) {
      this.explorerPos = { x: explorerPos.x, y: explorerPos.y || 0, z: explorerPos.z };

      // Medium 3: Fog of War zone discovery check (within 90m discovery radius)
      this.zones.forEach(z => {
        const dx = z.x - this.explorerPos.x;
        const dz = z.z - this.explorerPos.z;
        if (dx * dx + dz * dz < 8100) { // 90m
          this.discoveredZones.add(z.name);
        }
      });
    }

    // Throttle 2D canvas radar rasterization to 20 FPS (every 50ms) saving 70% 2D context CPU time
    this.renderTimer = (this.renderTimer || 0) + delta;
    if (this.renderTimer < 0.05) return;
    this.renderTimer = 0;

    this.blips = robots.map(r => ({
      x: r.mesh?.position?.x || r.pos?.[0] || 0,
      z: r.mesh?.position?.z || r.pos?.[2] || 0,
      color: r.meta?.color || '#00f0ff',
      isRobot: true
    }));

    this.render();
  }

  getDiscoveryProgress() {
    return {
      discovered: this.discoveredZones.size,
      total: this.zones.length,
      percentage: Math.round((this.discoveredZones.size / this.zones.length) * 100)
    };
  }

  project3D(x, y, z) {
    // Normalize to unit sphere surface
    const len = Math.hypot(x, y, z) || 1;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // Rotate around Y axis
    const cos = Math.cos(this.rotationAngle);
    const sin = Math.sin(this.rotationAngle);
    const rx = nx * cos + nz * sin;
    const rz = -nx * sin + nz * cos;

    return {
      screenX: (this.size / 2) + rx * this.radius,
      screenY: (this.size / 2) - ny * this.radius,
      visible: rz >= -0.15, // Visible in front or slightly near horizon
      depth: rz
    };
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = this.radius;

    ctx.clearRect(0, 0, this.size, this.size);

    // 1. Globe Background Disc
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
    grad.addColorStop(0.85, 'rgba(8, 47, 73, 0.45)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.3)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer Glowing Ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Latitude rings
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    [-0.5, 0, 0.5].forEach(latY => {
      const ringY = cy - latY * r;
      const ringR = Math.sqrt(Math.max(0, r * r - (latY * r) * (latY * r)));
      ctx.beginPath();
      ctx.ellipse(cx, ringY, ringR, ringR * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 3. Longitude Meridians
    for (let i = 0; i < 4; i++) {
      const angle = this.rotationAngle + (i * Math.PI / 4);
      const ex = Math.cos(angle) * r;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(ex), r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Draw Zone Anchors with Fog of War Distinction (Medium 3)
    this.zones.forEach(z => {
      const p = this.project3D(z.x, 20, z.z);
      if (p.visible) {
        const isDiscovered = this.discoveredZones.has(z.name);
        ctx.fillStyle = isDiscovered ? z.color : 'rgba(100, 116, 139, 0.45)';
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, isDiscovered ? 2.8 : 1.6, 0, Math.PI * 2);
        ctx.fill();

        if (isDiscovered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    // 5. Draw Companion Robots
    this.blips.forEach(b => {
      const p = this.project3D(b.x, 15, b.z);
      if (p.visible) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 6. Draw Explorer Blip (Pulsating Golden Blip)
    const expP = this.project3D(this.explorerPos.x, 25, this.explorerPos.z);
    if (expP.visible) {
      // Glow pulse
      const pulse = 4 + Math.sin(Date.now() * 0.006) * 1.5;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.beginPath();
      ctx.arc(expP.screenX, expP.screenY, pulse + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(expP.screenX, expP.screenY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
