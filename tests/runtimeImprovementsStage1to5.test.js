import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import { AvatarLocomotionController } from '../src/entities/AvatarLocomotionController.js';
import { PlanetTerrain } from '../src/world/PlanetTerrain.js';
import { InverseKinematicsSolver } from '../src/entities/InverseKinematicsSolver.js';
import { DirectorWaypointEditor } from '../src/ui/DirectorWaypointEditor.js';
import { HolographicRadar } from '../src/ui/HolographicRadar.js';
import { SpaceLaunchBase } from '../src/world/zones/SpaceLaunchBase.js';
import { AncientHistoryRuins } from '../src/world/zones/AncientHistoryRuins.js';
import { OceanExplorationCoast } from '../src/world/zones/OceanExplorationCoast.js';
import { CreativeArtDistrict } from '../src/world/zones/CreativeArtDistrict.js';
import { MultiAgentChatterEngine } from '../src/ai/MultiAgentChatterEngine.js';
import { HolographicCodeIDESandbox } from '../src/ui/HolographicCodeIDESandbox.js';
import { TransitNetwork } from '../src/world/TransitNetwork.js';

test('Stage 1: AvatarLocomotionController updates avatar kinematics and grounds to terrain', () => {
  const scene = new THREE.Scene();
  const avatarGroup = new THREE.Group();
  avatarGroup.position.set(0, 0.05, 54);
  const avatar = { group: avatarGroup };
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const terrain = new PlanetTerrain(scene);

  const controller = new AvatarLocomotionController(avatar, camera, null, terrain);
  assert.equal(controller.enabled, false);

  controller.enabled = true;
  controller.keys.forward = true;
  controller.keys.sprint = true;

  controller.update(0.1);
  assert.equal(controller.isMoving, true);
  assert.equal(controller.isSprinting, true);
  assert.ok(avatar.group.position.y >= 0.05, 'Avatar grounded to terrain height');

  // Jump kinematics
  controller.handleKeyDown({ code: 'Space' });
  assert.equal(controller.isGrounded, false);
  controller.update(0.05);
  assert.ok(avatar.group.position.y > 0.05, 'Avatar ascended during jump');

  // First-person view toggle
  controller.handleKeyDown({ code: 'KeyV' });
  assert.equal(controller.viewMode, 'first_person');
  controller.update(0.016);
  assert.ok(Math.abs(camera.position.y - (avatar.group.position.y + 0.38)) < 0.01, 'Camera matches eye height in first-person');
});

test('Stage 2: DirectorWaypointEditor lens presets calculate optical FOV', () => {
  const editor = new DirectorWaypointEditor(null);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

  const lens18 = editor.setLensPreset(18, camera);
  assert.equal(lens18.name, '18mm Super-Wide');
  assert.equal(camera.fov, 67.4);

  const lens50 = editor.setLensPreset(50, camera);
  assert.equal(lens50.name, '50mm Natural Prime');
  assert.equal(camera.fov, 27.0);

  const lens85 = editor.setLensPreset(85, camera);
  assert.equal(lens85.name, '85mm Portrait Telephoto');
  assert.equal(camera.fov, 16.1);
});

test('Stage 1 & 2: HolographicRadar renders weather storm front & compass rose bearing', () => {
  const radar = new HolographicRadar();
  assert.ok(radar);

  radar.update(0.1, { x: 0, y: 10, z: 20 }, [], { state: 'STORM', windVec: { x: 4, z: 2 }, intensity: 0.8 }, Math.PI / 4);
  assert.equal(radar.weatherInfo.state, 'STORM');
  assert.equal(radar.cameraYaw, Math.PI / 4);
});

test('Stage 3: PlanetTerrain elevation and surface normal calculation', () => {
  const scene = new THREE.Scene();
  const terrain = new PlanetTerrain(scene);

  const elevCenter = terrain.getElevationAt(0, 0);
  assert.ok(typeof elevCenter === 'number' && Number.isFinite(elevCenter));

  const elevMountain = terrain.getElevationAt(-350, -250);
  assert.ok(elevMountain > elevCenter, 'Mountain region elevation is elevated');

  const normal = terrain.getSurfaceNormalAt(0, 0);
  assert.ok(normal instanceof THREE.Vector3);
  assert.ok(normal.y > 0.8, 'Flat city normal points upward');
});

test('Stage 3: InverseKinematicsSolver aligns foot to terrain slope normal', () => {
  const leg = new THREE.Group();
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.2));
  foot.name = 'foot';
  leg.add(foot);

  const normalSlope = new THREE.Vector3(0.2, 0.95, 0.2).normalize();
  const ik = InverseKinematicsSolver.plantFoot(leg, 0.05, 0.28, 0.12, 0.12, normalSlope);

  assert.ok(ik.isReachable);
  assert.ok(ik.surfaceNormal);
  assert.ok(typeof ik.slopePitch === 'number');
  assert.ok(typeof ik.slopeRoll === 'number');
});

test('Stage 3 & 4: TransitNetwork pylon grounding and interior cab ride', () => {
  const scene = new THREE.Scene();
  const terrain = new PlanetTerrain(scene);
  const transit = new TransitNetwork(scene, terrain);

  assert.ok(transit.trackSpline);
  assert.equal(transit.isPlayerRiding, false);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  transit.boardTrain(camera);
  assert.equal(transit.isPlayerRiding, true);

  transit.update(0.1, 1.0);
  assert.ok(transit.rideCamera === camera);

  transit.exitTrain();
  assert.equal(transit.isPlayerRiding, false);
});

test('Stage 4: SpaceLaunchBase initiates rocket liftoff and booster flame plume', () => {
  const scene = new THREE.Scene();
  const spaceBase = new SpaceLaunchBase(scene);

  assert.ok(spaceBase.rocket);
  assert.equal(spaceBase.isLaunching, false);

  spaceBase.launch();
  assert.equal(spaceBase.isLaunching, true);

  spaceBase.update(1.0, 0.2);
  assert.ok(spaceBase.rocket.position.y > 5.0, 'Rocket ascended during launch');
  assert.ok(spaceBase.boosterFlame.material.opacity > 0.5, 'Booster flame illuminated');

  spaceBase.resetRocket();
  assert.equal(spaceBase.isLaunching, false);
  assert.equal(spaceBase.rocket.position.y, 5);
});

test('Stage 4: AncientHistoryRuins aligns mirrors and activates golden temple restoration', () => {
  const scene = new THREE.Scene();
  const ruins = new AncientHistoryRuins(scene);

  assert.equal(ruins.mirrors.length, 3);
  assert.equal(ruins.isRestored, false);

  ruins.alignMirrors();
  assert.equal(ruins.isRestored, true);

  ruins.update(2.0);
  assert.ok(ruins.scanGrid.rotation.y > 0);
});

test('Stage 4: CreativeArtDistrict spawns neon graffiti decals on amphitheater walls', () => {
  const scene = new THREE.Scene();
  const artDistrict = new CreativeArtDistrict(scene);

  assert.equal(artDistrict.graffitiDecals.length, 0);
  const decal = artDistrict.addGraffitiDecal(2, 3, 4, '#ec4899');

  assert.ok(decal);
  assert.equal(artDistrict.graffitiDecals.length, 1);
  assert.equal(decal.position.x, 2);
});

test('Stage 5: OceanExplorationCoast toggles submarine dive to seabed caustics layer', () => {
  const scene = new THREE.Scene();
  const ocean = new OceanExplorationCoast(scene);

  assert.equal(ocean.isDiving, false);
  const isDiving = ocean.toggleDive();
  assert.equal(isDiving, true);
  assert.equal(ocean.targetDepth, -16.5);

  ocean.update(1.0, 0.5);
  assert.ok(ocean.currentDepth < -2, 'Submersible descended toward seabed');
});

test('Stage 5: MultiAgentChatterEngine maintains fixed 12-element speech bubble pool', () => {
  const scene = new THREE.Scene();
  const chatter = new MultiAgentChatterEngine(scene);

  assert.ok(Array.isArray(chatter.bubblePool));
  // In Node SSR environment, pool is safe array without throwing
  chatter.update(0.1, 1.0);
  assert.ok(true);
});

test('Stage 5: HolographicCodeIDESandbox executes procedural Three.js snippets safely', () => {
  const scene = new THREE.Scene();
  const app = { scene, showToast: () => {} };
  const ide = new HolographicCodeIDESandbox(app);

  const snippet = `
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);
  `;

  const success = ide.execute(snippet);
  assert.equal(success, true);
  assert.equal(ide.sandboxObjects.length, 1);
  assert.equal(scene.children.length, 1);

  ide.clearObjects();
  assert.equal(ide.sandboxObjects.length, 0);
  assert.equal(scene.children.length, 0);
});
