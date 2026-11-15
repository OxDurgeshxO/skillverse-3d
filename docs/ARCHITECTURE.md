# Skillverse — System Architecture

## 1. High-Level Engine Hierarchy

```
SkillverseApp (src/main.js)
├── SkillverseCoordinator (src/core/SkillverseCoordinator.js)  [Event Bus & State Manager]
├── THREE.WebGLRenderer (ACESFilmic, PCFShadowMap, ToneMapping 1.15)
├── CameraSequencer (src/cinematics/CameraSequencer.js)        [Fixed 24mm Catmull-Rom Spline]
├── SpatialAudioEngine (src/audio/SpatialAudioEngine.js)       [Multi-Formant Synthesis & Ambience]
├── WorldManager (src/world/WorldManager.js)
│   ├── PlanetTerrain (src/world/PlanetTerrain.js)             [R=800m Curvature, Ocean Plane]
│   ├── TransitNetwork (src/world/TransitNetwork.js)           [Maglev Station, Planetary Loop, Cars]
│   ├── VolumetricCloudShader (src/shaders/volumetricCloud.js) [Perlin Ray-Marching Deck]
│   └── 12 Living Zones (src/world/zones/*.js)
│       ├── TechCity.js                                        [Wet Pavement SSR, Glass Towers]
│       ├── AIResearchValley.js                                [Geodesic Domes, Neural Dome]
│       ├── CreativeArtDistrict.js                             [Mobius Sculpture, Neon Stage]
│       ├── MedicalCareCity.js                                 [Hospital Arc, Emerald Cross]
│       ├── EngineeringHarbor.js                               [Container Docks, Cranes, Ships]
│       ├── GreenAgricultureFields.js                          [Aeroponic Towers, Solar Arrays]
│       ├── AdventureMountains.js                              [Granite Peaks, Suspension Bridge]
│       ├── OceanExplorationCoast.js                           [Offshore Rig, Robot Submarine]
│       ├── SpaceLaunchBase.js                                 [Rocket Pad, Gantry, Venting Steam]
│       ├── AncientHistoryRuins.js                             [Sandstone Temple, Laser Grid]
│       ├── SportsArena.js                                     [Stadium Dome, Kinetic Tracks]
│       └── GlobalLearningUniversity.js                        [Knowledge Spire, Hologram Globe]
├── Entity Layer
│   ├── ExplorerAvatar (src/entities/ExplorerAvatar.js)        [38cm Miniature Avatar & Holo Tablet]
│   ├── RobotBuilder (src/entities/RobotBuilder.js)            [Procedural 18 Humanoid Species]
│   └── STL3DPrintExporter (src/exporters/STL3DPrintExporter)  [ASCII Manifold STL Generator]
└── Production Pipeline
    ├── skillverse_generator.py                                [Generates JSON scene manifest]
    ├── ue5_auto_importer.py                                   [Builds UE5 Master Level Sequence]
    └── UE5_PRODUCTION_BIBLE.md & AI_VIDEO_PROMPT_MATRIX.md   [Production Specs & Prompt Tokens]
```

## 2. Master Lifecycle & Data Flow

Every animation frame:
1. `delta` and `time` are computed via Three.js clock.
2. In `cinematic` mode:
   - `CameraSequencer.update(delta)` evaluates spline points $\mathbf{P}(t)$ and targets $\mathbf{T}(t)$ at current time $t \in [0.0, 10.0]$.
   - Camera position and look-at are updated with fixed $73.74^\circ$ FOV.
   - UI HUD slider and timecode readouts update.
3. `SkillverseCoordinator.update(delta, time)` broadcasts tick events to subscribed subsystems.
4. `WorldManager.update(delta, time, sequencerTime)`:
   - Updates terrain wave perturbations.
   - Updates `TransitNetwork`: autonomous ground cars yield at crosswalk ($z = 55\text{m}$), and 3-car maglev train smoothly decelerates into Maglev Central Station platform ($z = 70\text{m}$) from $t = 6.0\text{s} \to 10.0\text{s}$.
   - Animates high-atmosphere flocking birds ($y = 520\text{m}$) and clouds ($y = 280\text{m}$).
   - Updates all active zones and wet pavement shader uniforms (`uTime`, `uSunColor`, `uSunDirection`).
5. Character updates:
   - `ExplorerAvatar.update`: arm and leg walk cadence ($3.6\text{ rad/s}$).
   - `RobotBuilder.animateRobot`: 18 skill robots execute walking cadence ($3.6\text{ rad/s}$) or idle work gestures (typing on hologram keyboard, pulsing chest soundwave equalizer, wielding welding torch).
6. Audio engine updates:
   - Evaluates camera altitude and distance to active zones, cross-fading stratospheric wind, urban hum, and electronic chirps.
7. Frame rendered via `renderer.render(scene, camera)`.

## 3. Planetary Curvature Formula
All global terrain and zone foundations adhere to the spherical drop equation:
$$\Delta y(x, z) = -\frac{x^2 + z^2}{2R}, \quad R = 800.0\text{ m}$$
This creates a realistic miniature Earth horizon visible during the 0–4s stratospheric descent.

## 4. Shaders & Physical Materials
- **Wet Pavement Shader** (`src/shaders/wetPavementShader.js`):
  - Base asphalt noise + smoothstep puddle mask.
  - Fresnel reflection ($0.04 + 0.96(1 - \mathbf{N}\cdot\mathbf{V})^5$).
  - Cool teal ambient shadows (`#02161e`).
  - Warm amber ($3200\text{K}$, `#ffaa52`) Planckian specular sun reflection.
- **Volumetric Cloud Shader** (`src/shaders/volumetricCloudShader.js`):
  - Multi-octave 3D Perlin ray-marching with sunset absorption and silver-lining scattering.
- **Hologram Shader** (`src/shaders/hologramShader.js`):
  - Additive blending, scanlines, Fresnel edge glow, and temporal flicker.
