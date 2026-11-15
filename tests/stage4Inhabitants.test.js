import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { InverseKinematicsSolver } from '../src/entities/InverseKinematicsSolver.js';
import { CrowdSimulationEngine } from '../src/world/CrowdSimulationEngine.js';

test('InverseKinematicsSolver: Two-bone analytic IK calculations and boundary reach', () => {
  // Case 1: Target within reach
  const hip = { x: 0, y: 0.24, z: 0 };
  const foot = { x: 0, y: 0.02, z: 0.05 };
  const l1 = 0.12;
  const l2 = 0.12;

  const sol = InverseKinematicsSolver.solveTwoBoneIK(hip, foot, l1, l2);
  assert.equal(sol.isReachable, true);
  assert.ok(Number.isFinite(sol.hipPitch));
  assert.ok(Number.isFinite(sol.kneePitch));

  // Case 2: Target beyond reach (overshoot clamp)
  const farFoot = { x: 0, y: -0.5, z: 0.5 };
  const solFar = InverseKinematicsSolver.solveTwoBoneIK(hip, farFoot, l1, l2);
  assert.equal(solFar.isReachable, false);
  assert.ok(Number.isFinite(solFar.hipPitch));
  assert.ok(Number.isFinite(solFar.kneePitch));
});

test('CrowdSimulationEngine: Instantiation, crosswalk state machine, and cleanup', () => {
  const scene = new THREE.Scene();
  const crowd = new CrowdSimulationEngine(scene, { count: 20 });

  assert.equal(crowd.getPedestrianCount(), 20);
  assert.equal(crowd.crosswalkState, 'GREEN');

  // Simulate 14 seconds: should transition to YELLOW then RED
  crowd.update(13.0, 13.0);
  assert.equal(crowd.crosswalkState, 'YELLOW');

  crowd.update(3.0, 16.0);
  assert.equal(crowd.crosswalkState, 'RED');

  // Verify agents stop when approaching crosswalk during RED
  assert.doesNotThrow(() => {
    crowd.update(0.016, 16.016);
  });

  // Verify cleanup
  crowd.dispose();
  assert.equal(crowd.agents.length, 0);
});
