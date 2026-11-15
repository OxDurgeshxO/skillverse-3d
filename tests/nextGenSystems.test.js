import { test } from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { WeatherEngine } from '../src/world/WeatherEngine.js';
import { DirectorWaypointEditor } from '../src/ui/DirectorWaypointEditor.js';
import { MultiAgentChatterEngine } from '../src/ai/MultiAgentChatterEngine.js';
import { SoundscapeMixer } from '../src/ui/SoundscapeMixer.js';
import { ZoneInteractions } from '../src/ui/ZoneInteractions.js';
import { TransitNetwork } from '../src/world/TransitNetwork.js';
import { CinematicLUTShader, PostProcessingPipeline } from '../src/shaders/PostProcessingPipeline.js';

test('WeatherEngine: Cycles procedural weather states and updates particle positions', () => {
  const scene = new THREE.Scene();
  const engine = new WeatherEngine(scene, null, null, null);

  assert.strictEqual(engine.currentWeather, 'CLEAR');
  const next = engine.toggleWeather();
  assert.strictEqual(next, 'OVERCAST');

  engine.setWeather('RAIN');
  assert.strictEqual(engine.targetWeather, 'RAIN');

  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
  camera.position.set(0, 10, 0);

  // Update weather animation
  engine.update(0.016, 1.0, camera);
  assert.ok(engine.rainGeometry !== null, 'Rain geometry initialized');
  assert.strictEqual(engine.rainGeometry.attributes.position.count, 1500);

  engine.dispose();
});

test('CinematicLUTShader & PostProcessingPipeline: Supports 4K Color Grading presets', () => {
  assert.ok(CinematicLUTShader.uniforms.uLUTMode !== undefined);

  const pipeline = new PostProcessingPipeline(null, null, null);
  assert.ok(pipeline.isMock, 'Headless mock gracefully handles SSR');

  // Should not throw in SSR mock mode
  pipeline.setLUTMode('CYBERPUNK');
  pipeline.setLUTMode('GOLDEN_HOUR');
  pipeline.setLUTMode('MATRIX_TEAL');
  pipeline.setLUTMode('MOONLIGHT_NOIR');
  pipeline.setLUTMode('TECHNICOLOR');
  pipeline.setLUTMode('NONE');
});

test('DirectorWaypointEditor: Manages waypoints, evaluates splines, and handles JSON import/export', () => {
  const editor = new DirectorWaypointEditor(null);
  assert.ok(editor.waypoints.length >= 3);

  const initialCount = editor.waypoints.length;
  const wp = editor.addWaypoint(new THREE.Vector3(10, 20, 30), new THREE.Vector3(0, 0, 0), 2.5, 35, 'Test WP');
  assert.strictEqual(editor.waypoints.length, initialCount + 1);

  // Spline evaluation
  const evaluated = editor.evaluate(0.5);
  assert.ok(evaluated !== null);
  assert.ok(evaluated.pos.isVector3);
  assert.ok(evaluated.target.isVector3);

  // JSON Serialization
  const json = editor.exportToJSON();
  assert.ok(json.includes('Test WP'));

  const parsed = editor.importFromJSON(json);
  assert.strictEqual(parsed, true);

  editor.removeWaypoint(wp.id);
  assert.strictEqual(editor.waypoints.length, initialCount);
});

test('MultiAgentChatterEngine: Triggers proximity conversations and manages Skill Quests', () => {
  const scene = new THREE.Scene();
  const engine = new MultiAgentChatterEngine(scene, null);

  // Skill Quest Log
  const quests = engine.getQuests();
  assert.strictEqual(quests.length, 4);

  const questId = quests[0].id;
  assert.strictEqual(quests[0].status, 'AVAILABLE');

  const accepted = engine.acceptQuest(questId);
  assert.strictEqual(accepted, true);
  assert.strictEqual(quests[0].status, 'ACTIVE');

  const completed = engine.completeQuest(questId);
  assert.strictEqual(completed, true);
  assert.strictEqual(quests[0].status, 'COMPLETED');

  // Robot proximity chatter
  const r1 = { mesh: new THREE.Group(), displayName: 'Coding Robot' };
  const r2 = { mesh: new THREE.Group(), displayName: 'AI Robot' };
  r1.mesh.position.set(0, 0, 0);
  r2.mesh.position.set(1.2, 0, 0); // 1.2m distance < 2.5m threshold

  let eventFired = false;
  engine.triggerChatter = () => { eventFired = true; };
  engine.update(0.016, 1.0, [r1, r2]);
  assert.strictEqual(eventFired, true);

  engine.dispose();
});

test('TransitNetwork: Constructs 6 planetary stations and exposes continuous trackSpline', () => {
  const scene = new THREE.Scene();
  const transit = new TransitNetwork(scene);

  assert.ok(transit.stations, 'Stations array initialized');
  assert.strictEqual(transit.stations.length, 6, 'Must contain 6 architectural passenger depots');

  const stationNames = transit.stations.map(s => s.name);
  assert.ok(stationNames.some(n => n.includes('Tech City')));
  assert.ok(stationNames.some(n => n.includes('Harbor')));
  assert.ok(stationNames.some(n => n.includes('Space Launch')));
  assert.ok(stationNames.some(n => n.includes('University')));
  assert.ok(stationNames.some(n => n.includes('Agriculture')));
  assert.ok(stationNames.some(n => n.includes('Art District')));

  assert.ok(transit.trackSpline !== null, 'trackSpline must be defined for continuous loop travel');
});

test('SoundscapeMixer: Enforces strict channel volume clamping across all 6 audio tracks', () => {
  const mixer = new SoundscapeMixer(null);
  const channels = mixer.getChannels();

  assert.strictEqual(Object.keys(channels).length, 6);
  assert.ok(channels.wind !== undefined);
  assert.ok(channels.city !== undefined);
  assert.ok(channels.transit !== undefined);
  assert.ok(channels.waterfall !== undefined);
  assert.ok(channels.robot !== undefined);
  assert.ok(channels.synth !== undefined);

  mixer.setVolume('wind', 0.5);
  assert.strictEqual(mixer.getVolume('wind'), 0.5);

  mixer.setVolume('transit', 1.8); // Clamp to 1.0
  assert.strictEqual(mixer.getVolume('transit'), 1.0);

  mixer.setVolume('robot', -0.5); // Clamp to 0.0
  assert.strictEqual(mixer.getVolume('robot'), 0.0);
});

test('ZoneInteractions: Executes terminal puzzle verification, sprint stopwatch, and spray colors', () => {
  const interactions = new ZoneInteractions(null);

  // Terminal Puzzle
  assert.strictEqual(interactions.terminalSolved, false);
  const fail = interactions.solveTerminalPuzzle('wrong answer');
  assert.strictEqual(fail, false);

  const pass = interactions.solveTerminalPuzzle('nodes.filter(n => n.active).reduce((sum, n) => sum + n.mw, 0)');
  assert.strictEqual(pass, true);
  assert.strictEqual(interactions.terminalSolved, true);

  // Sprint Stopwatch
  interactions.startSprint();
  assert.strictEqual(interactions.sprintRunning, true);
  const elapsed = interactions.stopSprint();
  assert.strictEqual(interactions.sprintRunning, false);
  assert.ok(typeof elapsed === 'number');

  // Spray Color
  interactions.setSprayColor('#ec4899');
  assert.strictEqual(interactions.activeSprayColor, '#ec4899');
});
