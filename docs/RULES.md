# Skillverse — Engineering Rules & Invariants

## 1. Scale & Metric Invariants
- **Miniature Earth Scale**:
  - Human Explorer Avatar: Exactly $0.38\text{ m}$ (38 cm).
  - Skill Robots: Range between $0.25\text{ m}$ and $0.35\text{ m}$ (25–35 cm).
  - Scale Ratio: Approximately $1.25:1$ (Explorer is only slightly taller than robots, reading as a miniature world).
  - Tabletop 3D Print STL: Scaled to exactly $28\text{ mm}$ physical gaming miniature height upon export.
  - Planetary Radius: $R = 800.0\text{ m}$.

## 2. Coordinate System & Orientations
- **Engine**: Three.js standard right-handed Cartesian coordinate system ($+Y$ Up, $+X$ East, $+Z$ South).
- **Core Coordinates**:
  - Tech City Center: $(0, 0, 0)$
  - Maglev Central Station Platform: $(0, 7.2, 70)$
  - Walking Quartet Position: $z \approx 54\text{ m} \to 55.4\text{ m}$, heading $+Z$ toward station.
  - Cloud Deck Altitude: $y = 280\text{ m}$
  - High Atmosphere Birds: $y = 520\text{ m}$
  - Camera Descent Start: $(0, 850, -420)$ looking toward $(0, 60, 40)$.

## 3. Cinematic Camera Invariants
- **Lens Profile**: Fixed 24mm ultra-wide lens. FOV must remain constant at $73.74^\circ$ ($45.3^\circ$ vertical at 16:9).
- **Zero Cuts**: The 10-second master sequence is strictly one continuous single shot. No cuts, morphs, or sudden position/angle jumps.
- **Pacing**:
  - $0.0\text{s} \to 4.0\text{s}$: Stratospheric cloud descent.
  - $4.0\text{s} \to 10.0\text{s}$: Forward glide settling at street level behind Explorer ($y = 0.52\text{m}, z = 51.5\text{m}$).

## 4. Graphics & Performance Budgets
- **Framerate Target**: 60 FPS @ 1920x1080; WebXR 90 FPS minimum.
- **Shadow Mapping**: Use `THREE.PCFShadowMap`. Never use removed `PCFSoftShadowMap`.
- **Tone Mapping**: `THREE.ACESFilmicToneMapping` with exposure $1.15$.
- **Material Sharing**: Shared joint, limb, and head geometries cached in `RobotBuilder` to minimize VRAM allocations.
- **WebGL Draw Calls**: Target $< 350$ draw calls per frame.

## 5. Governance & Safety
- **Explicit Approval Gate**: Never modify project files, commit, or push without explicit human chat instruction.
- **Caveman Mode**: Terse, smart, precise technical facts in chat communication.
