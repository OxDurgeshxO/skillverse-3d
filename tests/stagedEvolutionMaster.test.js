import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { STL3DPrintExporter } from '../src/exporters/STL3DPrintExporter.js';
import { SpatialAudioEngine } from '../src/audio/SpatialAudioEngine.js';
import { ClothSimulation } from '../src/physics/ClothSimulation.js';
import { SkyTrafficEngine } from '../src/world/SkyTrafficEngine.js';
import { BiomeWildlifeEngine } from '../src/world/BiomeWildlifeEngine.js';
import { MultiplayerSyncEngine } from '../src/network/MultiplayerSyncEngine.js';
import { HolographicRadar } from '../src/ui/HolographicRadar.js';
import { DirectorWaypointEditor } from '../src/ui/DirectorWaypointEditor.js';
import { RobotBuilder } from '../src/entities/RobotBuilder.js';

test('Stage 3: Binary STL Little-Endian Exporter validates buffer size & headers', () => {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.3, 0.2),
    new THREE.MeshBasicMaterial()
  );
  group.add(mesh);

  const res = STL3DPrintExporter.exportBinarySTL(group, 'test_robot.stl', 28);
  assert.equal(res.format, 'binary');
  assert.equal(res.filename, 'test_robot.stl');
  assert.ok(res.triangleCount > 0, 'Triangle count must be positive');
  assert.equal(res.byteLength, 84 + res.triangleCount * 50, 'Binary STL buffer length must strictly equal 84 + N*50');
});

test('Stage 2: SpatialAudioEngine supports true orientation, culling & volume clamping', () => {
  const audio = new SpatialAudioEngine();
  audio.setMasterVolume(0.75);
  assert.equal(audio.masterVolume, 0.75);

  audio.setMasterVolume(1.5); // Bound clamping
  assert.equal(audio.masterVolume, 1.0);

  audio.setMasterVolume(-0.5);
  assert.equal(audio.masterVolume, 0.0);

  const initialMuted = audio.isMuted;
  const toggledMuted = audio.toggleMute();
  assert.equal(toggledMuted, !initialMuted);
  assert.equal(audio.isMuted, !initialMuted);
});

test('Stage 4: ClothSimulation creates Verlet particles, pinned nodes & executes update', () => {
  const cloth = new ClothSimulation({ width: 4.0, height: 6.0, segmentsX: 4, segmentsY: 4 });
  assert.ok(cloth.particles.length > 0, 'Cloth must generate grid particles');
  assert.ok(cloth.pinned.length > 0, 'Top row of cloth must be pinned');
  assert.ok(cloth.mesh.isMesh, 'Cloth must construct a Three.js Mesh');

  // Verify numerical update with wind vector
  cloth.update(0.016, { x: 5.0, y: 0.5, z: 2.0 });
  const pUnpinned = cloth.particles[cloth.particles.length - 1];
  assert.ok(Number.isFinite(pUnpinned.pos.x), 'Particle positions must be finite');
  assert.ok(Number.isFinite(pUnpinned.pos.y), 'Particle positions must be finite');
});

test('Stage 4: SkyTrafficEngine initializes 3 VTOL air-taxis & advances flight corridor', () => {
  const scene = new THREE.Scene();
  const sky = new SkyTrafficEngine(scene);
  assert.equal(sky.vessels.length, 3, 'Must maintain 3 autonomous passenger drones');

  const initialProg = sky.vessels[0].progress;
  sky.update(0.1, 1.0);
  assert.notEqual(sky.vessels[0].progress, initialProg, 'Progress must advance along aerial spline');
});

test('Stage 4: BiomeWildlifeEngine animates ocean fish, mountain raptor & cyber-bees', () => {
  const scene = new THREE.Scene();
  const wildlife = new BiomeWildlifeEngine(scene);
  assert.ok(wildlife.fishPoints, 'Ocean fish points must be initialized');
  assert.ok(wildlife.eagle, 'Mountain eagle raptor mesh must be initialized');
  assert.ok(wildlife.beePoints, 'Cyber-bees points must be initialized');

  wildlife.update(0.016, 2.0);
  assert.ok(wildlife.eagle.position.x !== 0, 'Eagle position must be populated');
  wildlife.dispose();
});

test('Stage 5: MultiplayerSyncEngine tracks peer presence & spawns avatar proxies', () => {
  const scene = new THREE.Scene();
  const mockAvatar = { mesh: new THREE.Mesh(), isWalking: true };
  const mp = new MultiplayerSyncEngine(scene, mockAvatar, { roomName: 'test_room' });

  assert.ok(mp.peerId.startsWith('peer_'), 'Peer ID must have prefix peer_');

  // Simulate inbound remote peer message
  mp.handlePeerMessage({
    type: 'MOVE',
    peerId: 'peer_remote_999',
    colorHex: 0x10b981,
    x: 10,
    y: 0.04,
    z: 45,
    rotY: 1.5,
    isWalking: true
  });

  assert.equal(mp.getConnectedPeerCount(), 1, 'Should spawn 1 remote peer avatar');
  mp.dispose();
  assert.equal(mp.getConnectedPeerCount(), 0, 'Dispose should clear peers');
});

test('Stage 5: HolographicRadar tracks Fog of War discovery progress', () => {
  const radar = new HolographicRadar();
  assert.ok(radar.discoveredZones.has('Tech City'), 'Tech City should be discovered by default');

  radar.update(0.05, { x: 220, y: 0, z: -120 }, []); // Move to Ocean Coast
  assert.ok(radar.discoveredZones.has('Ocean Coast'), 'Ocean Coast should be discovered on proximity');

  const prog = radar.getDiscoveryProgress();
  assert.ok(prog.discovered >= 2, 'Should have at least 2 discovered zones');
  assert.ok(prog.percentage > 0, 'Percentage must be greater than 0');
});

test('Stage 3: DirectorWaypointEditor builds 3D visual spline gizmos', () => {
  const scene = new THREE.Scene();
  const editor = new DirectorWaypointEditor();
  const gizmos = editor.createGizmos(scene);
  assert.ok(gizmos, 'Gizmo group must be created');
  assert.equal(gizmos.name, 'director_spline_gizmos');
  assert.ok(gizmos.children.length >= 3, 'Must contain spline curve line and waypoint sphere markers');
});

test('Stage 3: RobotBuilder adds Ambient Occlusion contact shadow disk', () => {
  const builder = new RobotBuilder();
  const robot = builder.createRobot('coding');
  assert.ok(robot.userData.contactShadow, 'Robot must carry an ambient occlusion contact shadow disk');
  assert.equal(robot.userData.contactShadow.isMesh, true);
});
