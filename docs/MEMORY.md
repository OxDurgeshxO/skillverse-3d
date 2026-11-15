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

## 2. Performance Audit & 60 FPS De-Stalling Invariants (Phase 11)

### Synchronous `readRenderTargetPixels` Stalling
- **Finding**: Calling `renderer.readRenderTargetPixels()` synchronously every frame halts the GPU pipeline to wait for pixel readback and forces a CPU copy loop of 44,240 pixels into a 2D canvas context. Running this while rendering the entire planetary scene twice cut framerate by ~50%.
- **Invariant**: Default `PictureInPictureCamera.enabled = false`. When active, throttle rendering strictly to 15 FPS (`throttleElapsed < 0.066`).

### High-DPI DPR Clamping
- **Finding**: High-DPI 4K displays with `devicePixelRatio = 2.0` rendered at 3840x2160, running 5 post-processing passes with 9-tap tilt-shift texture fetches totaling ~80 million texture fetches/frame.
- **Invariant**: Clamp renderer DPR to `Math.min(window.devicePixelRatio, 1.25)`. Provides crystal-clear text on Retina screens while cutting fragment fill rate by $>60\%$.

### Layout Thrashing via Rapid DOM Mutation
- **Finding**: Mutating `document.title` and HUD DOM innerText 60 times/second forced the browser window manager and tab strip to repaint continuously.
- **Invariant**: Throttle telemetry DOM updates and title string updates to 4 Hz (every 250ms).

### 2D Canvas Radar Rasterization Overhead
- **Finding**: Drawing 3D spheres, arcs, blips, and text on a 2D canvas context at 60 FPS consumed 8ms of CPU main-thread time per frame.
- **Invariant**: Throttle `HolographicRadar.render()` to 20 FPS (50ms interval). Retains silky smooth radar blips while saving 70% 2D canvas rasterization overhead.

---

## 3. Security Audit & Memory Safety Invariants
- **Recursive WebGL GPU Disposal**:
  - `scene.remove(mesh)` alone does not free VRAM in WebGL. Explicit traversal with `child.geometry.dispose()` and `child.material.dispose()` is required to prevent GPU buffer accumulation.
- **Headless Node.js SSR Guarding**:
  - Web Audio (`AudioContext`), DOM (`document`), and window properties must always be guarded with `typeof window !== 'undefined'` and `typeof document !== 'undefined'` to allow clean execution in headless CI/CD test runners (`node --test`).
- **Input Sanitization**:
  - All DOM string insertions must pass through `escapeHTML()` to neutralize stored/reflected XSS vectors.
- **Test Baseline**:
  - 37 / 37 unit tests passing in `< 600ms` across all subsystems (`tests/**/*.test.js`).
  - Production build bundle compiles in `~330ms` with zero CVE vulnerabilities.
