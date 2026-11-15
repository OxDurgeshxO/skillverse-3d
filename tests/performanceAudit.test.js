import { test } from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { PictureInPictureCamera } from '../src/cinematics/PictureInPictureCamera.js';
import { PostProcessingPipeline } from '../src/shaders/PostProcessingPipeline.js';
import { WeatherEngine } from '../src/world/WeatherEngine.js';
import { HolographicRadar } from '../src/ui/HolographicRadar.js';
import { WorldManager } from '../src/world/WorldManager.js';

test('Performance Audit: PictureInPictureCamera supports toggle and throttles rendering to 15 FPS', () => {
  const pip = new PictureInPictureCamera({ width: 280, height: 158, enabled: false });
  assert.strictEqual(pip.enabled, false, 'PiP must be disabled by default in main app');

  // Verify toggle
  const active = pip.toggle();
  assert.strictEqual(active, true);
  assert.strictEqual(pip.enabled, true);

  // Throttling: subsequent render calls within 66ms must accumulate elapsed time
  const mockRenderer = {
    getRenderTarget: () => null,
    setRenderTarget: () => {},
    render: () => {},
    readRenderTargetPixels: () => {}
  };
  const mockScene = new THREE.Scene();

  pip.render(mockRenderer, mockScene, 0.016); // 1st frame (delta 16ms < 66ms)
  assert.strictEqual(pip.throttleElapsed, 0.016, 'PiP accumulates delta below 66ms threshold');

  pip.render(mockRenderer, mockScene, 0.060); // 16 + 60 = 76ms > 66ms
  assert.strictEqual(pip.throttleElapsed, 0, 'PiP resets throttle accumulator after firing');
});

test('Performance Audit: PostProcessingPipeline bypasses dormant passes & supports Quality Tiers', () => {
  const pipeline = new PostProcessingPipeline(null, null, null);
  assert.ok(pipeline.isMock);

  // Quality tier switching
  pipeline.setQualityTier('PERFORMANCE');
  assert.strictEqual(pipeline.qualityTier, 'PERFORMANCE');

  pipeline.setQualityTier('CINEMATIC');
  assert.strictEqual(pipeline.qualityTier, 'CINEMATIC');

  pipeline.setQualityTier('BALANCED');
  assert.strictEqual(pipeline.qualityTier, 'BALANCED');

  // Pipeline toggle
  const state = pipeline.togglePipeline();
  assert.strictEqual(state, false);
});

test('Performance Audit: WeatherEngine right-sized to 1500 particles and bypasses simulation on CLEAR', () => {
  const scene = new THREE.Scene();
  const weather = new WeatherEngine(scene, null, null, null);

  assert.strictEqual(weather.rainCount, 1500, 'Rain particles must be right-sized from 5,000 to 1,500');

  // On CLEAR weather, particle update loop is bypassed
  const camera = new THREE.PerspectiveCamera();
  weather.setWeather('CLEAR');
  weather.update(0.016, 1.0, camera);

  assert.strictEqual(weather.rainParticles.visible, false, 'Rain mesh must be hidden during CLEAR weather');
  weather.dispose();
});

test('Performance Audit: HolographicRadar throttles 2D canvas rasterization to 20 FPS', () => {
  const radar = new HolographicRadar({ planetRadius: 400 });
  let renderCount = 0;
  radar.render = () => { renderCount++; };

  radar.update(0.016); // 16ms < 50ms threshold
  assert.strictEqual(renderCount, 0, 'Canvas 2D redraw must be throttled below 50ms');

  radar.update(0.040); // total 56ms >= 50ms
  assert.strictEqual(renderCount, 1, 'Canvas 2D redraw executes once interval reached');
});

test('Performance Audit: WorldManager optimizes shadow map to 1024x1024 with tight bounds', () => {
  const scene = new THREE.Scene();
  const world = new WorldManager(scene);

  assert.strictEqual(world.sunLight.shadow.mapSize.width, 1024, 'Shadow map width must be 1024 for 60 FPS');
  assert.strictEqual(world.sunLight.shadow.mapSize.height, 1024, 'Shadow map height must be 1024 for 60 FPS');
  assert.strictEqual(world.sunLight.shadow.camera.left, -160, 'Shadow frustum must be tightly bounded to center');
  assert.strictEqual(world.sunLight.shadow.camera.right, 160);
});
