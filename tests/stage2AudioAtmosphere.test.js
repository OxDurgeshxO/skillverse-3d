import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SpatialAudioEngine } from '../src/audio/SpatialAudioEngine.js';
import { WorldManager } from '../src/world/WorldManager.js';

test('SpatialAudioEngine: Positional sources and surface footstep synthesis in SSR environment', () => {
  const audio = new SpatialAudioEngine();
  assert.equal(audio.isInitialized, false);

  // Calling spatial methods before/without browser AudioContext should be safe no-ops
  const source = audio.createPositionalSource();
  assert.ok(source);
  assert.equal(typeof source.setPosition, 'function');

  // Footstep synthesis calls with various surfaces
  assert.doesNotThrow(() => {
    audio.playFootstep('asphalt');
    audio.playFootstep('metal');
    audio.playFootstep('grass');
    audio.playFootstep('water');
  });

  // Transit whoosh call
  assert.doesNotThrow(() => {
    audio.playMaglevWhoosh();
  });

  // Update listener with Three.js camera dummy
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
  camera.position.set(0, 15, 30);
  assert.doesNotThrow(() => {
    audio.updateListener(camera);
  });
});

test('WorldManager: Astronomical 24-hour day/night cycle calculations', () => {
  const scene = new THREE.Scene();
  const world = new WorldManager(scene);

  // Default time of day
  assert.equal(world.timeOfDay, 17.5);

  // Test Solar Noon (12.0h)
  world.setTimeOfDay(12.0);
  assert.equal(world.timeOfDay, 12.0);
  assert.equal(world.isNight, false);
  assert.ok(world.sunLight.position.y > 300, `Sun elevation at noon should be > 300, got ${world.sunLight.position.y}`);

  // Test Midnight (0.0h)
  world.setTimeOfDay(0.0);
  assert.equal(world.timeOfDay, 0.0);
  assert.equal(world.isNight, true);
  assert.ok(world.sunLight.position.y < 0, `Sun elevation at midnight should be negative, got ${world.sunLight.position.y}`);

  // Clamping test: should clamp [0, 24]
  world.setTimeOfDay(35.0);
  assert.equal(world.timeOfDay, 24.0);
  world.setTimeOfDay(-5.0);
  assert.equal(world.timeOfDay, 0.0);
});
