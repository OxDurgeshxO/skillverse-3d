# Skillverse — System Architecture

## 1. High-Level Engine Hierarchy

```
SkillverseApp (src/main.js)
├── SkillverseCoordinator (src/core/SkillverseCoordinator.js)  [Event Bus & State Manager]
├── PerformanceTimer (src/core/PerformanceTimer.js)            [Monotonic Drift-Free Delta]
├── THREE.WebGLRenderer (ACESFilmic, PCFShadowMap, DPR 1.25 clamp)
├── CameraSequencer (src/cinematics/CameraSequencer.js)        [Fixed 24mm Catmull-Rom Spline]
├── DirectorWaypointEditor (src/cinematics/DirectorWaypointEditor.js) [3D Spline Designer & Gizmos]
├── PictureInPictureCamera (src/cinematics/PictureInPictureCamera.js) [15 FPS Multi-Perspective HUD]
├── SpatialAudioEngine (src/audio/SpatialAudioEngine.js)       [HRTF Spatialization & Vocoder]
├── SoundscapeMixer (src/audio/SoundscapeMixer.js)             [6-Channel Audio UI Console]
├── WeatherEngine (src/world/WeatherEngine.js)                 [Dynamic Rain, Clouds & Wind Vectors]
├── TransitNetwork (src/world/TransitNetwork.js)               [6 Planetary Stations & Monorail Loop]
├── SkyTrafficEngine (src/world/SkyTrafficEngine.js)           [Autonomous VTOL Air-Taxis]
├── ClothSimulation (src/physics/ClothSimulation.js)           [Verlet Dynamic Arcology Banners]
├── PhysicsWorld (src/physics/PhysicsWorld.js)                 [Ocean Buoyancy & Hydrodynamics]
├── MultiplayerSyncEngine (src/network/MultiplayerSyncEngine.js) [WebRTC P2P DataChannel Mesh]
├── WorldManager (src/world/WorldManager.js)
│   ├── PlanetTerrain (src/world/PlanetTerrain.js)             [R=800m Curvature, Ocean Plane]
│   ├── 12 Living Zones (src/world/zones/*.js)
│   └── VolumetricCloudShader (src/shaders/volumetricCloud.js)
├── Entity Layer
│   ├── ExplorerAvatar (src/entities/ExplorerAvatar.js)        [38cm Miniature Avatar & Holo Tablet]
│   ├── InverseKinematicsSolver (src/entities/InverseKinematicsSolver.js) [Two-Bone Foot Planting]
│   ├── RobotBuilder (src/entities/RobotBuilder.js)            [18 Procedural Species & SSS Shaders]
│   ├── CrowdSimulationEngine (src/world/CrowdSimulationEngine.js) [32 Autonomous Pedestrians]
│   └── MultiAgentChatterEngine (src/entities/MultiAgentChatterEngine.js) [Proximity AI & Quests]
├── UI & HUD
│   ├── HolographicRadar (src/ui/HolographicRadar.js)          [20 FPS 3D GPS & Fog of War]
│   ├── RobotCustomizerModal (src/ui/RobotCustomizerModal.js)  [360° Turntable PBR Builder]
│   └── VideoRecorderExporter (src/exporters/VideoRecorderExporter.js) [4K LUTs & 60 FPS Video]
└── Exporters & Network
    ├── STL3DPrintExporter (src/exporters/STL3DPrintExporter.js) [ASCII & Binary Little-Endian STL]
    └── skillverse_generator.py & ue5_auto_importer.py         [Offline UE5 Master Sequence]
```

## 2. Master Lifecycle & Data Flow

Every animation frame:
1. `delta` and `time` are computed via monotonic `PerformanceTimer` (clamped to max $0.1\text{s}$ to prevent physics explosion after tab defocus).
2. Camera state updated:
   - In `cinematic` mode: `CameraSequencer.update(delta)` evaluates spline points $\mathbf{P}(t)$ and targets $\mathbf{T}(t)$ with locked $73.74^\circ$ FOV.
   - In `street` mode: First-person camera locked to avatar eye position ($y = 0.52\text{m}$).
   - In `director` mode: `DirectorWaypointEditor` evaluates customized spline and renders visual 3D node gizmos.
3. World & Physics:
   - `WeatherEngine.update(delta)` updates rain particles, wind vectors, and sends `uRainIntensity` to `PostProcessingPipeline`.
   - `ClothSimulation.update(delta, windVector)` updates Verlet mass-spring nodes for arcology banners.
   - `SkyTrafficEngine.update(delta)` drives autonomous VTOL air-taxis along elevated sky corridors.
   - `TransitNetwork.update(delta, time, sequencerTime)` drives planetary monorail trains across 6 stations with Doppler spatial audio.
   - `PhysicsWorld.update(delta)` calculates hydrodynamic buoyancy and pitch/roll torque for maritime craft.
4. Characters & AI:
   - `ExplorerAvatar.update`: arm/leg walk cadence, IK foot planting, and footstep audio triggers.
   - `CrowdSimulationEngine.update`: 32 pedestrians with crosswalk obedience and elastic collision separation.
   - `MultiAgentChatterEngine.update`: Proximity evaluation between robots; triggers speech bubbles and Quest progress.
   - `MultiplayerSyncEngine.update`: Broadcasts local explorer telemetry and interpolates remote peer avatars.
5. Optics & Post-Processing:
   - `PostProcessingPipeline.render(scene, camera)`:
     - In `PERFORMANCE` tier: direct WebGL render with bloom.
     - In `BALANCED` / `CINEMATIC` tier: EffectComposer with UnrealBloom, Tilt-Shift Bokeh, and dynamic rain lens condensation shader.
   - Secondary `PictureInPictureCamera.render()` throttled to 15 FPS when enabled.
   - `HolographicRadar.render()` throttled to 20 FPS (50ms interval).
   - DOM and browser title telemetry throttled to 4 Hz (250ms).
