# Skillverse — Visual & UI Design System (DESIGN.md)

## 1. Aesthetic Direction: Solarpunk Arcology & Miniature Earth
Skillverse balances futuristic technology with human-scale organic warmth:
- **Architecture**: Glass and brushed titanium arcology towers, translucent canopies, vertical aeroponic gardens, clean geodesic mountain labs, and weathered ancient ruins.
- **Scale Tone**: Believable miniature world feeling — intricate sub-millimeter details, expressive LED eyes, subtle ceramic shell scratches, and soft natural depth-of-field.

## 2. Lighting & Color Palette

### A. Golden-Hour Post-Rain Atmosphere (Default Mode)
- **Sunlight**: $14^\circ$ low elevation, warm amber ($3200\text{K}$, `#ffaa52`), intensity $3.2$.
- **Sky & Ambient**: Cool teal ambient shadow tone (`#02161e` to `#0f172a`), hemisphere fill light (`#4778b0` sky, `#1a2e3b` ground).
- **Asphalt Puddle Reflections**: High specular reflectivity on wet surfaces with Fresnel mirror effect.

### B. Holographic Night Light Festival (Toggle Mode)
- **Sky**: Deep midnight indigo (`#020617`).
- **Volumetric Lasers**: 8 vertical $320\text{m}$ searchlight pillars shooting into the stratosphere (Cyan `#00f0ff`, Magenta `#ff007f`, Violet `#a855f7`, Emerald `#10b981`, Amber `#f59e0b`).
- **Street Neon**: Ground reflections glow with pulsing billboard signs and maglev undercarriage skirts.

## 3. Skill Robot Identity Matrix (18 Species)

| Skill Robot | Primary Shell | Accent / Glow | Signature Rig / Accessory |
| :--- | :--- | :--- | :--- |
| **Coding** | Matte Black `#09090b` | Cyan `#00f0ff` | Glowing circuit veins, translucent holo-keyboard |
| **AI & ML** | Polished White `#f8fafc` | Purple `#c084fc` | Pulsing neural dome, orbiting volumetric data orbs |
| **Engineering** | Safety Orange `#f97316` | Amber `#facc15` | Articulated utility arm, welding torch, carbon pack |
| **Medicine** | Sterile White `#ffffff` | Emerald `#10b981` | Glowing green cross, robotic suture/scanner kit |
| **Design** | Iridescent Titanium | Pink `#ec4899` | Digital stylus, orbiting chromatic color palettes |
| **Business** | Navy Blue `#1e3a8a` | Sky Blue `#60a5fa` | Translucent financial graphs, miniature briefcase |
| **Web Dev** | Silver Alloy `#94a3b8` | Blue `#38bdf8` | Illuminated HTML/CSS/JS chest matrix, UI panels |
| **Cybersecurity** | Gunmetal `#1e293b` | Crimson `#ef4444` | Red scanning eyes, hexagonal energy barrier |
| **Space** | Thermal Suit `#f1f5f9` | Gold `#eab308` | Gold reflective visor, cold-gas thruster pack, star map |
| **Science** | Lab White `#ffffff` | Quartz `#38bdf8` | Clear quartz dome, floating molecular lattices |
| **Art** | Splattered Ceramic | Multicolor | Artist apron, palette knives, sculpting tools |
| **Music** | Gloss Black `#0a0a0a` | Brass `#eab308` | Floating musical notes, micro acoustic instrument |
| **Agriculture** | Sage Green `#365314` | Bronze `#a3e635` | Soil laser probe, seed dispersal pods, canopy drone |
| **Travel** | Olive Polymer `#3f6212` | Lime `#84cc16` | Micro rucksack with bedroll, miniature hiking boots |
| **Sports** | Carbon Weave `#171717` | Green `#4ade80` | Aerodynamic servos, luminous kinetic motion trails |
| **Cooking** | Stainless Steel | Coral `#f87171` | Chef toque visor, silicone apron, recipe interface |
| **Teaching** | Warm Ivory `#ffedd5` | Copper `#fbbf24` | Holographic pointer, orbiting lesson spheres |
| **Communication** | Turquoise `#99f6e4` | Teal `#2dd4bf` | Dynamic soundwave chest equalizer, micro-mic |

## 4. Typography & UI Components
- **Display & Headings**: Space Grotesk (Weights: 400, 600, 700). Clean modern sans-serif with geometric precision.
- **Telemetry & Numbers**: JetBrains Mono (Weights: 400, 500, 700). Monospace font for timecodes, FPS, and altitudes.
- **Glassmorphic Paneling**:
  - Background: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(16px)`.
  - Borders: `1px solid rgba(56, 189, 248, 0.25)`.
  - Active accents: High-contrast cyan (`#00f0ff`) and amber (`#f59e0b`).
