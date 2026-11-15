# Skillverse — Product Requirements Document (PRD)

## 1. Vision & Core Concept
**Skillverse** is a hyper-realistic, cinematic 3D virtual world representing a vast living miniature Earth where every human skill is embodied by an intelligent miniature humanoid robot (25–35 cm tall). A young human explorer avatar (38 cm miniature scale, ~1.25:1 scale ratio to robots) explores the planet across 12 interconnected living zones, discovering how skill robots live, work, collaborate, and evolve.

## 2. Key Personas & Entities
- **Human Explorer Avatar**: 38 cm tall, practical futuristic jacket with orange safety trim, cargo pants, utility boots, handheld volumetric holographic tablet displaying planetary telemetry and mini-maps.
- **18 Humanoid Skill Robots**: 25–35 cm tall, procedural PBR ceramic shells, brushed titanium joints, glass visors, expressive LED eyes, floating skill badges, distinct color identities, signature work rigs, and multi-formant synthetic voices.
- **Co-op Peer Explorer**: Red alpine parka avatar with hovering scout drone on Tech City east promenade, ready for multi-player co-op presence.

## 3. The 12 Connected Living Zones
1. **Tech City**: Futuristic metropolis, glass towers, smart roads, Maglev Central Station ($z = 70\text{ m}$), wet asphalt boulevard with screen-space reflections, and kinetic arcology banners.
2. **AI Research Valley**: Mountain laboratory, geodesic domes, floating violet neural brain dome with orbiting data orbs, and VTOL sky corridor docks.
3. **Creative Art District**: Modular artist studios, rotating kinetic Mobius sculpture, neon concert amphitheater, interactive spray paint canvas.
4. **Medical Care City**: Clinical white hospital arc, glowing emerald cross beacons, diagnostic pavilion, emergency helipad.
5. **Engineering Harbor**: Industrial waterfront, container drydocks, animated rotating cranes, cargo ship, bridges.
6. **Green Agriculture Fields**: Vertical aeroponic towers, solar collector arrays with astronomical sun tracking, robotic harvesters, cyber-bee pollinators.
7. **Adventure Mountains**: Granite spires, pine forest, waterfalls, alpine suspension bridge, soaring raptors.
8. **Ocean Exploration Coast**: Sunlit coastline, offshore hexagonal research rig, robotic exploration submarine, bioluminescent fish schools.
9. **Space Launch Base**: Multi-stage orbital rocket, launch pad, gantry tower, cryogenic steam venting, telemetry dome.
10. **Ancient History Ruins**: Weathered sandstone temple, colonnade pillars, holographic laser restoration grid.
11. **Sports Arena**: Elliptical stadium, kinetic roof rings, sports pitch, motion training tracks, sprint stopwatch.
12. **Global Learning University**: Concentric rings, 65m crystalline knowledge spire with fluttering knowledge banners, floating planetary knowledge globe.

## 4. Master 10-Second Continuous Cinematic Shot
- **Optics & Framing**: Native 16:9 widescreen, fixed 24mm ultra-wide lens profile ($73.74^\circ$ H-FOV, $45.3^\circ$ V-FOV).
- **Zero Cuts / Zero Jumps**: Single uninterrupted Catmull-Rom crane-down spline.
- **Phase 1 (0.0s – 4.0s)**: High aerial drone descent ($y = 850\text{m} \to 110\text{m}$) through soft volumetric clouds above miniature Earth revealing distant mountain range and sunlit sea horizon; flock of 12 V-formation birds soaring at $y = 520\text{m}$.
- **Phase 2 (4.0s – 10.0s)**: Forward glide over glass towers and smart roads, smoothly settling at street level ($y = 0.52\text{m}, z = 51.5\text{m}$) directly behind the 38cm Explorer and 30cm walking quartet (Explorer + Coding + Travel + Comm robots) as a sleek 3-car maglev train glides into the Maglev Central Station platform ahead ($z = 70\text{m}$) and decelerates to dock.

## 5. Next-Gen Planetary Systems & Features
- **Procedural Weather Engine**: Dynamic weather cycles (Clear, Rain, Storm, Sunset Glow, Night Festival) driving wind velocity vectors, rain condensation on outer virtual camera lens, and puddle reflections.
- **Continuous 6-Station Transit Network**: Planetary monorail loop connecting Tech City, AI Valley, Harbor, Mountains, Ruins, and Space Base with interior passenger cab view and Doppler audio.
- **Autonomous Sky Traffic Corridors**: Electric VTOL passenger drones navigating 3D curved flight corridors between urban and research zones.
- **Verlet Cloth Dynamics**: Physical mass-spring fluttering banners across arcologies, sports arena, and university spires.
- **Multi-Agent Proximity AI & Quest Log**: Autonomous chatter between companion robots with spatial bubble popups and interactive 4-quest objective tracker.
- **Director Studio & Waypoint Designer**: 3D in-scene interactive spline gizmos, 4K photo studio with LUT color grading (Cyberpunk Teal, Golden Sunset, Noir Monochrome, Sci-Fi Emerald), and 60 FPS video recording.
- **Soundscape Equalizer Mixer**: 6-channel interactive audio console (Weather, Transit, Footsteps, Ambience, Birds, Chime) with robotic formant vocoder.
- **3D Robot Builder Customizer**: 360° turntable modal with PBR armor selection, LED color tuning, live world deployment, and ASCII/Binary STL 3D print export.
- **Multi-Player WebRTC Co-op**: Serverless peer-to-peer data channel mesh synchronizing explorer movement, rotation, and emotes.
- **Adaptive Performance Tiers**: Dynamic 60 FPS mode, DPR clamping ($1.25\times$), 20 FPS radar throttling, 15 FPS PiP throttling, and persistent quality settings.
