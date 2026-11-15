/**
 * HolographicRadar: 3D Miniature Holographic Globe GPS Radar HUD
 * Projects planet geography, explorer location, robot blips, and weather storm fronts.
 * Includes:
 * - Compass Rose & degree dial (Small 1)
 * - Dynamic Weather Isobars & Storm Front velocity vectors (Medium 5)
 * - Fog of War discovery progress (Medium 3)
 */
export class HolographicRadar {
  constructor({ containerId = 'radar-container', size = 110, planetRadius = 400 } = {}) {
    this.size = size;
    this.radius = (size / 2) - 12;
    this.planetRadius = planetRadius;
    this.rotationAngle = 0;
    this.cameraYaw = 0;
    this.blips = [];
    this.explorerPos = { x: 0, y: 0, z: 50 };
    this.discoveredZones = new Set(['Tech City']);
    this.weatherInfo = { state: 'CLEAR', windVec: { x: 2, y: 0, z: 1 }, intensity: 0 };

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
        <span class="radar-status" id="radar-bearing">000° N</span>
      </div>
    `;
    this.container.appendChild(this.canvas);
  }

  update(delta, explorerPos = null, robots = [], weatherData = null, cameraYaw = 0) {
    this.rotationAngle += delta * 0.35;
    this.cameraYaw = cameraYaw;

    if (explorerPos) {
      this.explorerPos = { x: explorerPos.x, y: explorerPos.y || 0, z: explorerPos.z };

      // Fog of War discovery check (within 90m discovery radius)
      this.zones.forEach(z => {
        const dx = z.x - this.explorerPos.x;
        const dz = z.z - this.explorerPos.z;
        if (dx * dx + dz * dz < 8100) {
          this.discoveredZones.add(z.name);
        }
      });
    }

    if (weatherData) {
      this.weatherInfo = weatherData;
    }

    // Update bearing in header
    if (this.container) {
      const deg = Math.round(((this.cameraYaw * 180 / Math.PI) + 360) % 360);
      const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const card = cardinals[Math.round(deg / 45) % 8];
      const bearingElem = this.container.querySelector('#radar-bearing');
      if (bearingElem) bearingElem.textContent = `${String(deg).padStart(3, '0')}° ${card}`;
    }

    // Throttle 2D canvas radar rasterization to 20 FPS (every 50ms)
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
    const len = Math.hypot(x, y, z) || 1;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    const cos = Math.cos(this.rotationAngle);
    const sin = Math.sin(this.rotationAngle);
    const rx = nx * cos + nz * sin;
    const rz = -nx * sin + nz * cos;

    return {
      screenX: (this.size / 2) + rx * this.radius,
      screenY: (this.size / 2) - ny * this.radius,
      visible: rz >= -0.15,
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

    // 2. Compass Rose Outer Dial & Cardinal Ticks (Small 1)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal Points attached to camera yaw orientation
    const cardinals = [
      { label: 'N', angle: 0, color: '#f43f5e' },
      { label: 'E', angle: Math.PI / 2, color: 'rgba(255,255,255,0.7)' },
      { label: 'S', angle: Math.PI, color: 'rgba(255,255,255,0.7)' },
      { label: 'W', angle: Math.PI * 1.5, color: 'rgba(255,255,255,0.7)' }
    ];

    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    cardinals.forEach(c => {
      const relAngle = c.angle - this.cameraYaw - Math.PI / 2;
      const tx = cx + Math.cos(relAngle) * (r + 7);
      const ty = cy + Math.sin(relAngle) * (r + 7);
      ctx.fillStyle = c.color;
      ctx.fillText(c.label, tx, ty);
    });

    // 3. Latitude & Longitude Wireframe
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    [-0.5, 0, 0.5].forEach(latY => {
      const ringY = cy - latY * r;
      const ringR = Math.sqrt(Math.max(0, r * r - (latY * r) * (latY * r)));
      ctx.beginPath();
      ctx.ellipse(cx, ringY, ringR, ringR * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    for (let i = 0; i < 4; i++) {
      const angle = this.rotationAngle + (i * Math.PI / 4);
      const ex = Math.cos(angle) * r;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(ex), r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Dynamic Weather Storm Front & Isobars (Medium 5)
    if (this.weatherInfo && this.weatherInfo.state !== 'CLEAR') {
      const isRain = this.weatherInfo.state === 'RAIN' || this.weatherInfo.state === 'STORM';
      ctx.strokeStyle = isRain ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 146, 60, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 4]);

      // Draw curved storm isobar front
      ctx.beginPath();
      const wave = Math.sin(Date.now() * 0.002) * 6;
      ctx.arc(cx + wave, cy, r * 0.7, -Math.PI / 4, Math.PI / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Wind velocity vector arrow
      const wv = this.weatherInfo.windVec || { x: 2, z: 1 };
      const windAngle = Math.atan2(wv.z, wv.x);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 10);
      ctx.lineTo(cx - 10 + Math.cos(windAngle) * 14, cy - 10 + Math.sin(windAngle) * 14);
      ctx.stroke();
    }

    // 5. Zone Anchors with Fog of War
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

    // 6. Companion Robots
    this.blips.forEach(b => {
      const p = this.project3D(b.x, 15, b.z);
      if (p.visible) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 7. Explorer Blip (Pulsating Golden Blip)
    const expP = this.project3D(this.explorerPos.x, 25, this.explorerPos.z);
    if (expP.visible) {
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
