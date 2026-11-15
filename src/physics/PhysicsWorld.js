/**
 * PhysicsWorld: Rigid-Body Dynamics & Ocean Wave Buoyancy Engine
 * Computes Archimedes buoyant force and hydrodynamic pitch/roll torque for floating harbor vessels.
 */
export class PhysicsWorld {
  constructor() {
    this.bodies = [];
    this.gravity = 9.81;
    this.waterDensity = 1025.0; // kg/m^3
  }

  /**
   * Evaluates procedural ocean surface wave height at (x, z) at time t
   */
  getWaveHeight(x, z, t) {
    const w1 = Math.sin(x * 0.04 + t * 1.2) * 0.75;
    const w2 = Math.cos(z * 0.05 + t * 0.95) * 0.55;
    const w3 = Math.sin((x + z) * 0.03 + t * 1.5) * 0.35;
    return w1 + w2 + w3;
  }

  /**
   * Evaluates wave surface normal (spatial gradient) for tilt/torque
   */
  getWaveGradient(x, z, t) {
    const eps = 0.5;
    const hCenter = this.getWaveHeight(x, z, t);
    const hX = this.getWaveHeight(x + eps, z, t);
    const hZ = this.getWaveHeight(x, z + eps, t);

    const gradX = (hX - hCenter) / eps;
    const gradZ = (hZ - hCenter) / eps;

    return { gradX, gradZ };
  }

  /**
   * Registers a floating 3D mesh with buoyant properties
   */
  addFloatingBody(mesh, { mass = 800, waterlineY = 0.0, buoyancyCoeff = 4.5, damping = 2.2 } = {}) {
    const body = {
      mesh,
      mass,
      waterlineY,
      buoyancyCoeff,
      damping,
      vy: 0,
      pitch: 0,
      roll: 0,
      baseX: mesh.position.x,
      baseZ: mesh.position.z
    };
    this.bodies.push(body);
    return body;
  }

  update(delta, time) {
    const dt = Math.min(delta, 0.1);

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      const pos = b.mesh.position;

      // 1. Calculate wave elevation at vessel position
      const waveY = (b.waterlineY || 0.0) + this.getWaveHeight(b.baseX, b.baseZ, time);
      const waveGrad = this.getWaveGradient(b.baseX, b.baseZ, time);

      // 2. Buoyancy spring-damper vertical physics
      const depth = waveY - pos.y;
      const fBuoyancy = depth * b.buoyancyCoeff * this.gravity;
      const fDamping = -b.vy * b.damping;
      const ay = (fBuoyancy + fDamping);

      b.vy += ay * dt;
      pos.y += b.vy * dt;

      // 3. Hydrodynamic pitch & roll torque alignment with safe maritime angular clamping (+-24 deg)
      const maxAngle = 0.42; // ~24 degrees maximum list/trim
      const targetPitch = Math.max(-maxAngle, Math.min(maxAngle, waveGrad.gradZ * 0.65));
      const targetRoll = Math.max(-maxAngle, Math.min(maxAngle, -waveGrad.gradX * 0.65));

      b.pitch += (targetPitch - b.pitch) * dt * 3.5;
      b.roll += (targetRoll - b.roll) * dt * 3.5;
      b.pitch = Math.max(-maxAngle, Math.min(maxAngle, b.pitch));
      b.roll = Math.max(-maxAngle, Math.min(maxAngle, b.roll));

      b.mesh.rotation.x = b.pitch;
      b.mesh.rotation.z = b.roll;
    }
  }

  dispose() {
    this.bodies = [];
  }
}
