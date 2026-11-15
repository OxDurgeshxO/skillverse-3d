import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { escapeHTML, clampNumber, disposeHierarchy } from '../src/main.js';
import { STL3DPrintExporter } from '../src/exporters/STL3DPrintExporter.js';
import { SpatialAudioEngine } from '../src/audio/SpatialAudioEngine.js';

test('Security Audit: escapeHTML neutralizes XSS payloads', () => {
  const payloads = [
    { input: '<script>alert(1)</script>', expected: '&lt;script&gt;alert(1)&lt;/script&gt;' },
    { input: '<img src=x onerror="alert(\'XSS\')">', expected: '&lt;img src=x onerror=&quot;alert(&#39;XSS&#39;)&quot;&gt;' },
    { input: '"><svg onload=alert(document.cookie)>', expected: '&quot;&gt;&lt;svg onload=alert(document.cookie)&gt;' },
    { input: 'Safe Text & Numbers 123', expected: 'Safe Text &amp; Numbers 123' },
    { input: '', expected: '' },
    { input: null, expected: '' },
    { input: undefined, expected: '' }
  ];

  payloads.forEach(({ input, expected }) => {
    const sanitized = escapeHTML(input);
    assert.equal(sanitized, expected, `Payload "${input}" must be safely sanitized`);
    assert.ok(!sanitized.includes('<'), 'Sanitized string must never contain raw "<"');
    assert.ok(!sanitized.includes('>'), 'Sanitized string must never contain raw ">"');
  });
});

test('Security Audit: clampNumber enforces strict mathematical bounds and rejects NaN/Infinity', () => {
  // Timeline boundaries [0.0, 10.0]
  assert.equal(clampNumber(5.5, 0.0, 10.0), 5.5, 'Valid float must be preserved');
  assert.equal(clampNumber(-3.2, 0.0, 10.0), 0.0, 'Negative numbers must clamp to min (0.0)');
  assert.equal(clampNumber(15.8, 0.0, 10.0), 10.0, 'Excessive numbers must clamp to max (10.0)');

  // Fault injection / NaN / Injection strings
  assert.equal(clampNumber('NaN', 0.0, 10.0, 0.0), 0.0, 'NaN string must fallback to 0.0');
  assert.equal(clampNumber('malicious_string', 0.0, 10.0, 0.0), 0.0, 'Non-numeric string must fallback to 0.0');
  assert.equal(clampNumber(NaN, 0.0, 10.0, 0.0), 0.0, 'Literal NaN must fallback to 0.0');
  assert.equal(clampNumber(Infinity, 0.0, 10.0, 0.0), 0.0, 'Infinity must fallback to 0.0');
  assert.equal(clampNumber(-Infinity, 0.0, 10.0, 0.0), 0.0, '-Infinity must fallback to 0.0');
});

test('Security Audit: disposeHierarchy safely reclaims WebGL GPU memory without throwing', () => {
  const root = new THREE.Group();
  
  // Child 1: Mesh with geometry and material
  const geom1 = new THREE.BoxGeometry(1, 1, 1);
  const mat1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh1 = new THREE.Mesh(geom1, mat1);
  root.add(mesh1);

  // Child 2: Nested group with multi-material mesh
  const nested = new THREE.Group();
  const geom2 = new THREE.SphereGeometry(1, 8, 8);
  const mat2a = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const mat2b = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const mesh2 = new THREE.Mesh(geom2, [mat2a, mat2b]);
  nested.add(mesh2);
  root.add(nested);

  assert.doesNotThrow(() => {
    disposeHierarchy(root);
  }, 'disposeHierarchy must traverse and clean complex scene trees without errors');

  // Verify calling on null/undefined handles gracefully
  assert.doesNotThrow(() => {
    disposeHierarchy(null);
    disposeHierarchy(undefined);
  });
});

test('Security Audit: STL3DPrintExporter sanitizes filenames and defends against path traversal', () => {
  const dummyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  const group = new THREE.Group();
  group.add(dummyMesh);

  const maliciousFilenames = [
    { input: '../../../../etc/passwd', expectedExt: '.stl' },
    { input: '..\\..\\windows\\system32\\cmd.exe', expectedExt: '.stl' },
    { input: 'robot<script>alert(1)</script>.stl', expectedExt: '.stl' },
    { input: 'null\0byte.stl', expectedExt: '.stl' },
    { input: '   malicious|pipe*wildcard?.stl   ', expectedExt: '.stl' }
  ];

  maliciousFilenames.forEach(({ input, expectedExt }) => {
    const res = STL3DPrintExporter.exportToSTL(group, input, 28);
    assert.ok(res.filename, 'Must return sanitized filename');
    assert.ok(res.filename.endsWith(expectedExt), `Filename must strictly end with ${expectedExt}`);
    assert.ok(!res.filename.includes('..'), 'Must not contain directory traversal ".."');
    assert.ok(!res.filename.includes('/'), 'Must not contain path separators "/"');
    assert.ok(!res.filename.includes('\\'), 'Must not contain path separators "\\"');
    assert.ok(!res.filename.includes('<'), 'Must not contain injection "<"');
    assert.ok(!res.filename.includes('>'), 'Must not contain injection ">"');
    assert.ok(!res.filename.includes('|'), 'Must not contain pipe character "|"');
  });
});

test('Security Audit: SpatialAudioEngine operates safely in headless SSR Node environment', () => {
  const audio = new SpatialAudioEngine();
  assert.equal(audio.isInitialized, false, 'Audio must not be initialized before user interaction');

  // Must not throw ReferenceError: window is not defined
  assert.doesNotThrow(() => {
    audio.init();
    audio.update(5.0, 100);
    audio.toggle();
    audio.playRobotChirp();
    audio.speakRobotVocal('coding');
  }, 'SpatialAudioEngine must fail safely and silently in headless/SSR environments');
});
