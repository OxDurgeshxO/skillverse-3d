# Skillverse — Product Requirements Document (PRD)

## 1. Vision & Core Concept
**Skillverse** is a hyper-realistic, cinematic 3D virtual world representing a vast living miniature Earth where every human skill is embodied by an intelligent miniature humanoid robot (25–35 cm tall). A young human explorer avatar (38 cm miniature scale, ~1.25:1 scale ratio to robots) explores the planet across 12 interconnected living zones, discovering how skill robots live, work, collaborate, and evolve.

## 2. Key Personas & Entities
- **Human Explorer Avatar**: 38 cm tall, practical futuristic jacket with orange safety trim, cargo pants, utility boots, handheld volumetric holographic tablet displaying planetary telemetry and mini-maps.
- **18 Humanoid Skill Robots**: 25–35 cm tall, procedural PBR ceramic shells, brushed titanium joints, glass visors, expressive LED eyes, floating skill badges, distinct color identities, signature work rigs, and multi-formant synthetic voices.
- **Co-op Peer Explorer**: Red alpine parka avatar with hovering scout drone on Tech City east promenade.

## 3. The 12 Connected Living Zones
1. **Tech City**: Futuristic metropolis, glass towers, smart roads, Maglev Central Station ($z = 70\text{ m}$), wet asphalt boulevard with screen-space reflections.
2. **AI Research Valley**: Mountain laboratory, geodesic domes, floating violet neural brain dome with orbiting data orbs.
3. **Creative Art District**: Modular artist studios, rotating kinetic Mobius sculpture, neon concert amphitheater.
4. **Medical Care City**: Clinical white hospital arc, glowing emerald cross beacons, diagnostic pavilion, emergency helipad.
5. **Engineering Harbor**: Industrial waterfront, container drydocks, animated rotating cranes, cargo ship, bridges.
6. **Green Agriculture Fields**: Vertical aeroponic towers, solar collector arrays, robotic harvesters.
7. **Adventure Mountains**: Granite spires, pine forest, waterfalls, alpine suspension bridge, hiking trails.
8. **Ocean Exploration Coast**: Sunlit coastline, offshore hexagonal research rig, robotic exploration submarine.
9. **Space Launch Base**: Multi-stage orbital rocket, launch pad, gantry tower, cryogenic steam venting, telemetry dome.
10. **Ancient History Ruins**: Weathered sandstone temple, colonnade pillars, holographic laser restoration grid.
11. **Sports Arena**: Elliptical stadium, kinetic roof rings, sports pitch, holographic motion training tracks.
12. **Global Learning University**: Concentric rings, 65m crystalline knowledge spire, floating planetary knowledge globe.

## 4. Master 10-Second Continuous Cinematic Shot
- **Optics & Framing**: Native 16:9 widescreen, fixed 24mm ultra-wide lens profile ($73.74^\circ$ H-FOV, $45.3^\circ$ V-FOV).
- **Zero Cuts / Zero Jumps**: Single uninterrupted Catmull-Rom crane-down spline.
- **Phase 1 (0.0s – 4.0s)**: High aerial drone descent ($y = 850\text{m} \to 110\text{m}$) through soft volumetric clouds above miniature Earth revealing distant mountain range and sunlit sea horizon; flock of 12 V-formation birds soaring at $y = 520\text{m}$.
- **Phase 2 (4.0s – 10.0s)**: Forward glide over glass towers and smart roads, smoothly settling at street level ($y = 0.52\text{m}, z = 51.5\text{m}$) directly behind the 38cm Explorer and 30cm walking quartet (Explorer + Coding + Travel + Comm robots) as a sleek 3-car maglev train glides into the Maglev Central Station platform ahead ($z = 70\text{m}$) and decelerates to dock.

## 5. Interactive Runtime Features
- **Timeline Scrubber**: Real-time seeking from $0.00\text{s}$ to $10.00\text{s}$ with phase HUD readouts.
- **Camera Modes**: 10s Cinematic, 360° Free Orbit, First-Person Street Explorer ($1.68\text{m}$ eye height), Scale Inspector ($1.25:1$ ratio).
- **18-Skill Roster & Inspector Card**: Slide-out drawer with 3D print STL mesh exporter (28 mm tabletop scale).
- **Conversational Dialogue Terminal**: Two-way interactive chat with robotic speech synthesis and live 3D holographic code widget compilation.
- **Holographic Night Festival Toggle**: Smooth day/night lighting transition with 8 vertical 320m volumetric laser searchlights.
- **WebXR VR**: 6DoF immersive VR support for Oculus Quest / Apple Vision Pro.
