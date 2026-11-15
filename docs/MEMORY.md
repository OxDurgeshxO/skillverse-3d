# Skillverse — Engineering Memory & Knowledge Base (MEMORY.md)

## 1. Key Architectural Decisions

### A. Fixed 24mm Lens Profile ($73.74^\circ$ FOV)
- **Problem**: Changing focal lengths dynamically between high aerial descent (e.g. 18mm) and street level (e.g. 50mm) introduced artificial zoom compression and broke the single continuous shot illusion.
- **Solution**: Locked the camera to a fixed 24mm ultra-wide lens profile across all 9 Catmull-Rom spline keyframes ($73.74^\circ$ horizontal, $45.3^\circ$ vertical at 16:9). This preserves continuous optical perspective from 850m down to 52cm street height.

### B. Miniature Scale Calibration (38 cm Explorer Avatar)
- **Problem**: At 175 cm human scale, the Explorer towered 6x over 30 cm robots, causing the city to read as a toy set rather than a believable miniature planet.
- **Solution**: Scaled the Explorer avatar to $0.38\text{ m}$ (38 cm). At a $1.25:1$ ratio to the 30 cm robots, the Explorer is only slightly taller than companion robots, making the surrounding glass towers, monorail trains, and biomes read as a believable living miniature Earth.

### C. Maglev Station & Deceleration Corridor
- **Problem**: The original maglev bridge was located behind the camera trajectory at $z = 5\text{ m}$.
- **Solution**: Built the dedicated Maglev Central Station at $z = 70\text{ m}$ ($y = 6.7\text{m}$ platform height) spanning the boulevard ahead of the approaching quartet. Synchronized train movement in `TransitNetwork.js` so that between $t = 6.0\text{s}$ and $10.0\text{s}$, the train decelerates smoothly into the dock directly in front of the group as the camera settles at $z = 51.5\text{ m}$.

---

## 2. Critical Bug Fixes & Gotchas

### Three.js Shadow Map Deprecation
- **Error**: `THREE.WebGLShadowMap: PCFSoftShadowMap has been removed.`
- **Fix**: Replaced with `THREE.PCFShadowMap` in `src/main.js`. Clean, high-performance soft shadows without console deprecation warnings.

### Robot Accessory Limb Attachment Order
- **Error**: `RobotBuilder.js: TypeError: Cannot read properties of undefined (reading 'add')` when attaching welding torches or micro-microphones to limbs.
- **Root Cause**: `addSignatureAccessories` was called before `robot.userData` was populated with `armLeft`, `armRight`, `legLeft`, etc.
- **Fix**: Initialized all limb references inside `robot.userData` before invoking signature accessory builders.

### CRLF Shader Edit Gotcha on Windows
- **Issue**: Multi-line target strings in `edit_file` can fail to match if CRLF line endings differ from LF strings.
- **Fix**: Target smaller contiguous single blocks or normalize line endings when editing shader files like `wetPavementShader.js`.

---

## 3. Performance & Optimization Baselines
- **WebGL Tone Mapping**: ACES Filmic with exposure 1.15 produces crisp specular highlights on wet pavement without clipping neon billboard color channels.
- **Catmull-Rom Splines**: Centripetal tension (0.5) ensures smooth acceleration curves without overshoot artifacts when passing near building facades.
