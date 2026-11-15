import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HolographicRadar } from '../src/ui/HolographicRadar.js';
import { PictureInPictureCamera } from '../src/cinematics/PictureInPictureCamera.js';
import { VideoRecorderExporter } from '../src/exporters/VideoRecorderExporter.js';

test('HolographicRadar: 3D Spherical projection and radar telemetry tracking', () => {
  const radar = new HolographicRadar({ size: 100 });
  assert.equal(radar.size, 100);

  // Test 3D orthographic projection onto sphere surface
  const p1 = radar.project3D(0, 20, 100);
  assert.ok(Number.isFinite(p1.screenX));
  assert.ok(Number.isFinite(p1.screenY));
  assert.equal(typeof p1.visible, 'boolean');

  // Update loop without DOM context
  assert.doesNotThrow(() => {
    radar.update(0.016, { x: -10, y: 0.5, z: 54 }, []);
  });
});

test('PictureInPictureCamera: Multi-perspective modes and camera positioning', () => {
  const pip = new PictureInPictureCamera({ width: 240, height: 135 });
  assert.equal(pip.activeMode, 'drone');
  assert.equal(pip.enabled, true);

  // Switching modes
  pip.setMode('maglev');
  assert.equal(pip.activeMode, 'maglev');
  pip.setMode('tower');
  assert.equal(pip.activeMode, 'tower');
  pip.setMode('drone');
  assert.equal(pip.activeMode, 'drone');

  // Update each mode without throwing
  assert.doesNotThrow(() => {
    pip.update(0.016, 1.0, {});
    pip.setMode('maglev');
    pip.update(0.016, 2.0, {});
    pip.setMode('tower');
    pip.update(0.016, 3.0, {});
  });
});

test('VideoRecorderExporter: MediaRecorder stream and snapshot safety', () => {
  const mockCanvas = {
    toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    captureStream: null
  };
  const exporter = new VideoRecorderExporter(mockCanvas);

  assert.equal(exporter.isSupported(), false); // in Node environment
  assert.equal(exporter.isRecording, false);

  // Snapshot fallback
  const snap = exporter.captureSnapshot('test.png');
  // In Node, document is undefined so captureSnapshot returns safely
  assert.ok(snap === null || typeof snap === 'string');
});
