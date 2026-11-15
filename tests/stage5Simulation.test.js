import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GpuParticleSystem } from '../src/shaders/GpuParticleSystem.js';
import { PhysicsWorld } from '../src/physics/PhysicsWorld.js';
import { RobotVoiceAgentBridge } from '../src/ai/RobotVoiceAgentBridge.js';

test('GpuParticleSystem: 50,000 particle geometry attributes and shader update', () => {
  const scene = new THREE.Scene();
  const particleSys = new GpuParticleSystem(scene, { count: 50000 });

  assert.equal(particleSys.count, 50000);
  assert.ok(particleSys.geometry.getAttribute('position'));
  assert.ok(particleSys.geometry.getAttribute('velocity'));
  assert.ok(particleSys.geometry.getAttribute('emitterType'));
  assert.ok(particleSys.geometry.getAttribute('lifetime'));
  assert.equal(particleSys.geometry.getAttribute('position').count, 50000);

  // Shader update call
  assert.doesNotThrow(() => {
    particleSys.update(2.5);
  });
  assert.equal(particleSys.material.uniforms.uTime.value, 2.5);

  // Disposal
  particleSys.dispose();
  assert.equal(particleSys.pointsMesh, null);
});

test('PhysicsWorld: Ocean wave buoyancy and hydrodynamic pitch/roll calculation', () => {
  const physics = new PhysicsWorld();

  const h = physics.getWaveHeight(0, 0, 1.0);
  assert.ok(Number.isFinite(h));

  const grad = physics.getWaveGradient(0, 0, 1.0);
  assert.ok(Number.isFinite(grad.gradX));
  assert.ok(Number.isFinite(grad.gradZ));

  // Add dummy mesh
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 4), new THREE.MeshBasicMaterial());
  mesh.position.set(240, 0, -40);

  const body = physics.addFloatingBody(mesh, { mass: 500 });
  assert.equal(physics.bodies.length, 1);

  // Update physics step
  physics.update(0.016, 2.0);
  assert.ok(Number.isFinite(mesh.position.y));
  assert.ok(Number.isFinite(mesh.rotation.x));
  assert.ok(Number.isFinite(mesh.rotation.z));
});

test('RobotVoiceAgentBridge: Safe SSR instantiation and mic toggle handling', () => {
  const bridge = new RobotVoiceAgentBridge(null, null);
  assert.equal(bridge.isListening, false);
  assert.equal(bridge.recognition, null); // In Node environment
  assert.equal(bridge.toggleListening(), false);
});
