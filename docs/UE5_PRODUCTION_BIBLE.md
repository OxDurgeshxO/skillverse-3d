# Skillverse — Unreal Engine 5 Production Bible & Sequencer Architecture

This document provides exact technical configurations for setting up and rendering the 10-second seamless continuous flythrough of **Skillverse** in Unreal Engine 5.5 / 5.6 using Lumen, Nanite, Substrate PBR materials, Niagara VFX, and Movie Render Queue at 8K resolution.

---

## 1. Project World & Scale Setup

- **World Settings**:
  - Distance Units: 1 Unreal Unit = 1 Centimeter.
  - Explorer Avatar Height: `175.0 cm`.
  - Skill Robot Height Range: `25.0 cm – 35.0 cm`.
  - Planet Curvature Radius: `80,000.0 cm` (800 meters virtual miniature planet scale).
- **Substrate / PBR Material Settings**:
  - Enable Substrate Materials (Beta/Production).
  - Ceramic Robot Shells: Base Color PBR, Roughness `0.22`, Metallic `0.15`, Clearcoat `0.85`, Clearcoat Roughness `0.08`.
  - Brushed Titanium Joints: Metallic `0.92`, Roughness `0.28`, Anisotropy `0.65`.
  - Wet Asphalt Pavement: Base Color Dark Slate (`#0B0E14`), Roughness Map with puddle masks (`0.04` in puddles, `0.68` on dry grain), Normal Map with screen-space planar reflections.

---

## 2. CineCameraActor & Sequencer Rig

Create a single continuous `CineCameraActor` in the Master Level Sequence with **zero cuts**:

- **Sensor Settings**:
  - Sensor Preset: `Super 35mm 2.39:1 Anamorphic` (or `Full Frame 36x24mm` with 2.39:1 crop mask).
  - Filmback: Width `24.89 mm`, Height `10.41 mm`.
- **Keyframe Spline Pacing (10.00 Seconds @ 60.0 FPS = 600 Frames)**:

| Timestamp | Frame | Camera Position (X, Y, Z cm) | Look-At Focus (X, Y, Z cm) | Focal Length | Aperture | Shot Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0.00s** | 0 | `(0, -38000, 95000)` | `(0, 2000, 4000)` | 24mm | $f/4.0$ | High orbital descent, volumetric stratocumulus clouds |
| **1.80s** | 108 | `(-1500, -22000, 38000)` | `(0, 2000, 3000)` | 28mm | $f/3.5$ | Cloud deck penetration, golden-hour God rays |
| **2.50s** | 150 | `(0, -11000, 18000)` | `(0, 2000, 2500)` | 35mm | $f/2.8$ | Skimming Tech City glass arcology towers |
| **4.00s** | 240 | `(-400, -3000, 4500)` | `(0, 1500, 2000)` | 35mm | $f/2.8$ | Weaving between glass canyons, passing skycars |
| **5.20s** | 312 | `(0, 500, 1600)` | `(0, 500, 1400)` | 40mm | $f/2.2$ | Gliding directly under elevated maglev bridge |
| **5.80s** | 348 | `(-1150, 5200, 45)` | `(-950, 5600, 40)` | 50mm | $f/1.8$ | Touchdown at 45 cm elevation above wet pavement |
| **7.50s** | 450 | `(-880, 6000, 55)` | `(-950, 5800, 120)`| 50mm | $f/1.8$ | Tracking Explorer avatar and miniature robots |
| **8.50s** | 510 | `(2500, 11000, 4500)` | `(32000, -18000, 3000)` | 35mm | $f/4.0$ | Smooth ascending crane tilt, roofline clearing |
| **10.00s**| 600 | `(14000, 16000, 18000)`| `(42000, -26000, 2000)` | 21mm | $f/5.6$ | Master wide reveal: Harbor, Mountains, Ocean, Space Base |

---

## 3. Lighting & Volumetric Atmosphere

- **Directional Light (Golden-Hour Sun)**:
  - Intensity: `75,000 Lux`.
  - Color Temperature: `3,200 K` (Warm golden amber).
  - Sun Elevation: `14.2°`, Sun Azimuth: `215.0°`.
  - Light Source Angle: `0.53°` for physically realistic soft shadow penumbra.
  - Atmosphere Sun Light: Enabled.
- **Sky Atmosphere & Volumetric Cloud Component**:
  - Rayleigh Scattering: Blue `(0.15, 0.42, 0.95)`, Absorption: Warm amber.
  - Volumetric Cloud Material: 2-layer Stratocumulus with Henyey-Greenstein Forward Phase `g = 0.55`.
  - Cloud Bottom Altitude: `260 m`, Cloud Thickness: `120 m`.
- **Lumen Global Illumination & Hardware Ray-Tracing**:
  - Global Illumination: Lumen (Hardware Ray Tracing enabled, Hit Lighting for Reflections).
  - Max Trace Distance: `200,000 cm`.
  - Reflections: Lumen Ray Tracing with High Quality Screen Traces.
  - Shadow Map Method: Virtual Shadow Maps (VSM).

---

## 4. Niagara VFX Systems

1. **Space Launch Base Cryogenic Venting (`NS_CryoSteam`)**:
   - Continuous vapor release along rocket stage umbilicals.
   - Initial velocity `Z = 120 cm/s`, drag `0.8`, expansion scale over life `1.0 -> 4.5`, soft alpha erosion.
2. **Wet Street Water Splash & Rain Mist (`NS_StreetPuddles`)**:
   - Micro-droplet mist on asphalt surface when vehicle tires or robot feet step through puddles.
3. **Coding Robot Circuit Glow (`NS_CircuitPulse`)**:
   - Ribbon particles pulsing along UV spline traces with cyan additive emission (`#00F0FF`, 450 cd/m²).

---

## 5. Movie Render Queue (MRQ) 8K Render Configuration

- **Output Resolution**: `7680 x 3216` (8K 2.39:1 DCI Anamorphic).
- **Anti-Aliasing**:
  - Spatial Sample Count: `4`.
  - Temporal Sample Count: `16`.
  - Anti-Aliasing Method: `None` (pure super-sampling for maximum texture sharpness).
- **Console Variables for Ultra-Fidelity**:
  ```ini
  r.Lumen.Reflections.MaxRoughnessToTrace=0.85
  r.Lumen.DiffuseIndirect.Allow=1
  r.Shadow.Virtual.MaxPhysicalPages=8192
  r.MotionBlurQuality=4
  r.DepthOfFieldQuality=4
  r.RayTracing.Reflections.MaxRoughness=0.9
  ```
