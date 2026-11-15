import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CameraSequencer } from '../src/cinematics/CameraSequencer.js';

test('CameraSequencer: Initializes with fixed 24mm lens profile', () => {
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
  const sequencer = new CameraSequencer(camera);

  assert.equal(sequencer.duration, 10.0, 'Total sequence duration must be 10.0 seconds');
  assert.equal(sequencer.focalLength24mmFov, 73.74, 'Fixed 24mm lens profile must be 73.74 degrees FOV');
  assert.equal(camera.fov, 73.74, 'Camera FOV must match fixed 24mm lens profile');
});

test('CameraSequencer: Evaluates spline trajectory continuously across 10 seconds', () => {
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
  const sequencer = new CameraSequencer(camera);

  // Sample along 100 time slices
  for (let t = 0.0; t <= 10.0; t += 0.5) {
    sequencer.seek(t);
    assert.equal(sequencer.currentTime, t);
    assert.equal(camera.fov, 73.74, 'FOV must remain constant across all timecodes');
    assert.ok(camera.position.y >= 0.45, `Camera altitude at t=${t} must be >= street level (0.45m), got ${camera.position.y}`);
  }

  // Phase 1 check: high altitude
  sequencer.seek(0.0);
  assert.ok(camera.position.y > 800, 'Start altitude must be > 800m for high aerial descent');

  // Phase 2 check: street level settle behind explorer
  sequencer.seek(10.0);
  assert.ok(camera.position.y <= 0.6 && camera.position.y >= 0.5, 'Final camera altitude must be settled at street level ~0.52m');
  assert.ok(camera.position.z > 50, 'Final camera position must be behind explorer at z ~ 51.5m');
});
