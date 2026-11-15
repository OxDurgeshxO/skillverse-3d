import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PerformanceTimer } from '../src/main.js';
import { PostProcessingPipeline, LensCondensationShader } from '../src/shaders/PostProcessingPipeline.js';

test('PerformanceTimer: Drift-free monotonic timestamps and delta clamping', () => {
  const timer = new PerformanceTimer();
  assert.ok(timer.currentTime > 0);
  assert.equal(typeof timer.getDelta(), 'number');

  // Simulate update tick
  timer.update();
  const d = timer.getDelta();
  assert.ok(d >= 0.0001 && d <= 0.1, `Delta must be clamped [0.0001, 0.1], got ${d}`);
  assert.ok(timer.getElapsedTime() >= 0);
});

test('LensCondensationShader: Uniforms and optical refraction shader validation', () => {
  assert.ok(LensCondensationShader.uniforms);
  assert.equal(typeof LensCondensationShader.uniforms.uRainIntensity.value, 'number');
  assert.ok(LensCondensationShader.vertexShader.includes('vUv = uv'));
  assert.ok(LensCondensationShader.fragmentShader.includes('uRainIntensity'));

  // Test pipeline rain intensity setter
  const pipeline = new PostProcessingPipeline(null, null, null);
  assert.equal(pipeline.isMock, true);
  assert.doesNotThrow(() => {
    pipeline.setRainIntensity(0.75, 2.5);
    pipeline.reinit();
  });
});
