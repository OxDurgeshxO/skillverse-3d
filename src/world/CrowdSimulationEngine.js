import * as THREE from 'three';

/**
 * CrowdSimulationEngine: Autonomous Pedestrian Crowd & Crosswalk Pathfinding
 * Simulates 30+ miniature humanoid citizens and service droids walking sidewalks and respecting crosswalk signals.
 */
export class CrowdSimulationEngine {
  constructor(scene, { count = 36 } = {}) {
    this.scene = scene;
    this.count = count;
    this.agents = [];
    this.crosswalkState = 'GREEN'; // 'GREEN' | 'YELLOW' | 'RED'
    this.crosswalkTimer = 0;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.initAgents();
  }

  initAgents() {
    // 2 Boulevard sidewalk corridors in Tech City:
    // Left sidewalk: X in [-12, -7], Z in [30, 85]
    // Right sidewalk: X in [7, 12], Z in [30, 85]
    // Crosswalk line at Z = 55.0
    const colors = [0x00f0ff, 0xc084fc, 0x38bdf8, 0x10b981, 0xf59e0b, 0xe2e8f0];

    const bodyGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8);
    const headGeom = new THREE.SphereGeometry(0.038, 8, 8);
    const visorGeom = new THREE.BoxGeometry(0.042, 0.018, 0.02);

    for (let i = 0; i < this.count; i++) {
      const isEastSide = i % 2 === 0;
      const baseTrackX = isEastSide ? (8.0 + (Math.random() * 2.5)) : (-8.0 - (Math.random() * 2.5));
      const startZ = 32 + (i / this.count) * 50;
      const speed = 0.8 + Math.random() * 0.6;
      const direction = (i % 4 < 2) ? 1 : -1; // Heading North (+Z) or South (-Z)

      const agentGroup = new THREE.Group();
      const col = colors[i % colors.length];

      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.35,
        metalness: 0.7
      });
      const body = new THREE.Mesh(bodyGeom, mat);
      body.position.y = 0.14;
      agentGroup.add(body);

      const head = new THREE.Mesh(headGeom, mat);
      head.position.y = 0.25;
      agentGroup.add(head);

      const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const visor = new THREE.Mesh(visorGeom, visorMat);
      visor.position.set(0, 0.25, 0.035);
      agentGroup.add(visor);

      // Legs
      const legGeom = new THREE.BoxGeometry(0.025, 0.11, 0.03);
      const legL = new THREE.Mesh(legGeom, mat);
      legL.position.set(-0.03, 0.055, 0);
      const legR = new THREE.Mesh(legGeom, mat);
      legR.position.set(0.03, 0.055, 0);
      agentGroup.add(legL);
      agentGroup.add(legR);

      agentGroup.position.set(baseTrackX, 0.02, startZ);
      agentGroup.rotation.y = (direction > 0) ? 0 : Math.PI;

      this.group.add(agentGroup);

      this.agents.push({
        mesh: agentGroup,
        legL,
        legR,
        x: baseTrackX,
        z: startZ,
        speed,
        direction,
        isWaiting: false,
        phaseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  update(delta, time) {
    // 1. Crosswalk Traffic Light State Machine
    // 12s Green, 3s Yellow, 9s Red
    this.crosswalkTimer = (this.crosswalkTimer + delta) % 24.0;
    if (this.crosswalkTimer < 12.0) {
      this.crosswalkState = 'GREEN';
    } else if (this.crosswalkTimer < 15.0) {
      this.crosswalkState = 'YELLOW';
    } else {
      this.crosswalkState = 'RED';
    }

    const crosswalkZ = 55.0;
    const stopDistance = 1.8;

    // 2. Update each agent with steering & collision avoidance
    for (let i = 0; i < this.agents.length; i++) {
      const a = this.agents[i];

      // Check crosswalk stop line
      let shouldStop = false;
      if (this.crosswalkState === 'RED') {
        const distToCrosswalk = Math.abs(a.z - crosswalkZ);
        const isApproaching = (a.direction > 0 && a.z < crosswalkZ) || (a.direction < 0 && a.z > crosswalkZ);
        if (isApproaching && distToCrosswalk < stopDistance) {
          shouldStop = true;
        }
      }

      a.isWaiting = shouldStop;

      if (!shouldStop) {
        // Move forward along boulevard sidewalk
        a.z += a.direction * a.speed * delta * 1.8;

        // Wrap around boulevard ends [30, 85]
        if (a.z > 84) {
          a.z = 32;
        } else if (a.z < 31) {
          a.z = 83;
        }

        // Animate legs when walking
        const walkCycle = Math.sin(time * 8.0 * a.speed + a.phaseOffset);
        a.legL.rotation.x = walkCycle * 0.45;
        a.legR.rotation.x = -walkCycle * 0.45;
      } else {
        // Stand still at crosswalk
        a.legL.rotation.x = 0;
        a.legR.rotation.x = 0;
      }

      // Planetary curvature elevation correction (R = 800m)
      const curvatureDrop = -(a.x * a.x + a.z * a.z) / 1600.0;
      const walkBob = shouldStop ? 0.0 : Math.abs(Math.sin(time * 16.0 * a.speed)) * 0.012;
      a.mesh.position.y = 0.04 + curvatureDrop + walkBob;
      a.mesh.position.x = a.x;
      a.mesh.position.z = a.z;

      a.mesh.position.z = a.z;
    }
  }

  getPedestrianCount() {
    return this.agents.length;
  }

  dispose() {
    this.scene.remove(this.group);
    this.agents.forEach(a => {
      a.mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    });
    this.agents = [];
  }
}
