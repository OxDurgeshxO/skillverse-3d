"""
Skillverse — Procedural 3D World & Cinematic Sequencer Generator
Python 3.11 Pipeline Script for Blender 3D and Unreal Engine 5 Import
Updated: Full Structural Integration & Alignment
"""

import json
import math
import os
import sys

def generate_skillverse_scene_manifest(output_path="skillverse_scene_manifest.json"):
    print("[Skillverse Generator] Building planetary scene manifest...")

    # World Metadata & Scale Conventions
    manifest = {
        "world_name": "Skillverse",
        "scale_convention": {
            "explorer_miniature_height_m": 0.38,
            "miniature_robot_height_range_m": [0.25, 0.35],
            "planet_radius_m": 800.0,
            "miniature_scale_ratio": "approx 1.25:1 (Explorer to 30cm Robots) creating a believable miniature planet"
        },
        "cinematic_flythrough": {
            "total_duration_seconds": 10.0,
            "aspect_ratio": "16:9 Widescreen (Native)",
            "lens_profile": "Fixed 24mm Ultra-Wide Lens (73.74 deg H-FOV, 45.3 deg V-FOV)",
            "fps": 60,
            "shot_type": "10-Second Continuous Crane-Down Single Shot (Zero Cuts, Zero Jumps)",
            "phases": [
                {
                    "phase": 1,
                    "name": "Aerial Cloud Descent & Horizon Reveal",
                    "time_range": [0.0, 4.0],
                    "camera_altitude_start_m": 850.0,
                    "camera_altitude_end_m": 110.0,
                    "focal_length_mm": 24,
                    "fov_deg": 73.74,
                    "shot_type": "High Aerial Drone Crane-Down",
                    "lighting": "Golden Hour Sunlight (14 deg elevation), Volumetric Clouds, Distant Mountain Range & Sea Horizon",
                    "action": "Slow descent piercing soft volumetric clouds with god rays, flock of 12 V-formation birds gliding southwest across high atmosphere."
                },
                {
                    "phase": 2,
                    "name": "Tech City Forward Glide & Street Level Settle Behind Explorer",
                    "time_range": [4.0, 10.0],
                    "camera_altitude_start_m": 110.0,
                    "camera_altitude_end_m": 0.52,
                    "focal_length_mm": 24,
                    "fov_deg": 73.74,
                    "shot_type": "Forward Canyon Glide to Street-Level Behind-Avatar Tracking",
                    "lighting": "Wet reflective asphalt with cool teal shadows (#02161e) and warm amber (3200K) highlights",
                    "action": "Gliding forward over glass towers and smart roads, smoothly settling at street level (y=0.52m, z=51.5m) behind 38cm Explorer and 3 companion robots (Coding, Travel, Comm) walking toward Maglev Central Station (z=70m) as sleek maglev train glides in."
                }
            ],
            "camera_spline_keyframes": [
                {"t": 0.0, "pos": [0.0, 850.0, -420.0], "look_at": [0.0, 60.0, 40.0], "fov": 73.74},
                {"t": 1.8, "pos": [-10.0, 520.0, -320.0], "look_at": [0.0, 35.0, 40.0], "fov": 73.74},
                {"t": 3.2, "pos": [0.0, 240.0, -180.0], "look_at": [0.0, 20.0, 45.0], "fov": 73.74},
                {"t": 4.0, "pos": [0.0, 110.0, -90.0], "look_at": [0.0, 20.0, 45.0], "fov": 73.74},
                {"t": 5.8, "pos": [-0.4, 32.0, -15.0], "look_at": [-0.5, 8.0, 55.0], "fov": 73.74},
                {"t": 7.2, "pos": [-0.5, 8.5, 25.0], "look_at": [-0.5, 0.7, 56.0], "fov": 73.74},
                {"t": 8.5, "pos": [-0.5, 1.4, 46.0], "look_at": [-0.5, 0.45, 60.0], "fov": 73.74},
                {"t": 9.5, "pos": [-0.5, 0.55, 50.8], "look_at": [-0.5, 1.2, 68.0], "fov": 73.74},
                {"t": 10.0, "pos": [-0.5, 0.52, 51.5], "look_at": [-0.5, 1.4, 70.0], "fov": 73.74}
            ]
        },
        "zones": [
            {"id": "tech_city", "name": "Tech City", "pos": [0, 0, 0], "features": "Glass arcologies, smart roads, Maglev Central Station (z=70), wet asphalt boulevard"},
            {"id": "ai_valley", "name": "AI Research Valley", "pos": [-240, 25, -160], "features": "White geodesic domes, floating neural brain, orbiting data orbs"},
            {"id": "art_district", "name": "Creative Art District", "pos": [-120, 5, 120], "features": "Vibrant modular studios, kinetic mobius sculpture, concert amphitheater"},
            {"id": "medical_city", "name": "Medical Care City", "pos": [130, 4, 110], "features": "Curved clinical towers, glowing green cross, emergency helipad"},
            {"id": "harbor", "name": "Engineering Harbor", "pos": [240, 2, -40], "features": "Container docks, orange gantry cranes, cargo ship, bridges"},
            {"id": "agriculture", "name": "Green Agriculture Fields", "pos": [-150, 4, -80], "features": "Vertical aeroponic towers, solar collectors, robotic harvesters"},
            {"id": "mountains", "name": "Adventure Mountains", "pos": [-360, 20, -260], "features": "Granite spires, pine forest, waterfalls, suspension trails"},
            {"id": "ocean", "name": "Ocean Exploration Coast", "pos": [380, -4, 260], "features": "Offshore research rig, robotic submarine, coral shelf"},
            {"id": "space_base", "name": "Space Launch Base", "pos": [420, 2, -260], "features": "Launch pad, multi-stage orbital rocket, cryogenic steam, telemetry dome"},
            {"id": "ruins", "name": "Ancient History Ruins", "pos": [-60, 3, 250], "features": "Sandstone colonnades, stepped pyramid, holographic laser restore grid"},
            {"id": "arena", "name": "Sports Arena", "pos": [-220, 4, 30], "features": "Elliptical stadium, kinetic roof rings, holographic motion tracks"},
            {"id": "university", "name": "Global Learning University", "pos": [80, 5, -120], "features": "Concentric academic rings, central knowledge spire, holographic globe"}
        ],
        "skill_robots": [
            {
                "name": "Coding Robot",
                "height_m": 0.30,
                "color_primary": "Matte Black",
                "glow": "Glowing cyan circuit veins, cyan LED eyes",
                "accessory": "Translucent holographic keyboard",
                "zone": "Tech City Boulevard (Walking Quartet)",
                "pos": [-1.0, 0.05, 54.3],
                "activity": "Walking alongside Explorer heading toward Maglev Central Station"
            },
            {
                "name": "AI & ML Robot",
                "height_m": 0.30,
                "color_primary": "White/Violet",
                "glow": "Purple neural dome",
                "accessory": "Orbiting volumetric data orbs",
                "zone": "Tech City Boulevard",
                "pos": [-10.2, 0.15, 56.8],
                "activity": "Training predictive neural models for autonomous navigation"
            },
            {
                "name": "Engineering Robot",
                "height_m": 0.34,
                "color_primary": "Safety Orange",
                "glow": "Welding spark emitter",
                "accessory": "Articulated mechanical arm & carbon backpack",
                "zone": "Tech City Transit Hub",
                "pos": [-8.4, 0.15, 54.2],
                "activity": "Diagnostics and structural maintenance on maglev track"
            },
            {
                "name": "Medicine Robot",
                "height_m": 0.26,
                "color_primary": "Clinical White",
                "glow": "Emerald green cross",
                "accessory": "Suture/scanner diagnostic pack",
                "zone": "Tech City Promenade",
                "pos": [-10.5, 0.15, 54.5],
                "activity": "Assisting citizens and monitoring health metrics"
            },
            {
                "name": "Design Robot",
                "height_m": 0.27,
                "color_primary": "Iridescent Titanium",
                "glow": "Prismatic light ring",
                "accessory": "Digital stylus & floating color palette",
                "zone": "Tech City Art Plaza",
                "pos": [-8.9, 0.15, 52.0],
                "activity": "Generating adaptive architectural facade textures"
            },
            {
                "name": "Business Robot",
                "height_m": 0.29,
                "color_primary": "Formal Navy Blue",
                "glow": "Financial data graphs",
                "accessory": "Miniature briefcase",
                "zone": "Tech City Financial Sector",
                "pos": [-10.3, 0.15, 52.2],
                "activity": "Coordinating resource allocation across all 12 zones"
            },
            {
                "name": "Web Dev Robot",
                "height_m": 0.27,
                "color_primary": "Brushed Silver",
                "glow": "HTML/CSS/JS chest matrix",
                "accessory": "Floating interface screens",
                "zone": "Tech City Studio Hub",
                "pos": [-15.0, 0.15, 35.0],
                "activity": "Publishing live public telemetry portals for citizen avatars"
            },
            {
                "name": "Cybersecurity Robot",
                "height_m": 0.32,
                "color_primary": "Gunmetal Armor",
                "glow": "Red energy barrier",
                "accessory": "Crimson scanning visor",
                "zone": "Tech City Central Server Gateway",
                "pos": [0.0, 0.15, 20.0],
                "activity": "Guarding core planetary data streams from adversarial threats"
            },
            {
                "name": "Space Exploration Robot",
                "height_m": 0.35,
                "color_primary": "Thermal Suit White",
                "glow": "Gold reflective visor",
                "accessory": "Cold-gas thruster pack & star map",
                "zone": "Space Launch Base",
                "pos": [418.0, 3.5, -255.0],
                "activity": "Final pre-flight telemetry verification for heavy rocket"
            },
            {
                "name": "Science Robot",
                "height_m": 0.28,
                "color_primary": "Laboratory White",
                "glow": "Quartz dome resonance",
                "accessory": "Micro-centrifuge & molecule lattices",
                "zone": "AI Research Valley Lab",
                "pos": [-238.0, 26.0, -158.0],
                "activity": "Analyzing environmental data and soil sample spectroscopy"
            },
            {
                "name": "Art Robot",
                "height_m": 0.28,
                "color_primary": "Paint-stained Ceramic",
                "glow": "Color mixing aura",
                "accessory": "Artist apron & sculpting knives",
                "zone": "Creative Art District",
                "pos": [-118.0, 6.0, 122.0],
                "activity": "Painting interactive responsive murals on district arcologies"
            },
            {
                "name": "Music Robot",
                "height_m": 0.29,
                "color_primary": "Gloss Black & Gold",
                "glow": "Floating musical staves",
                "accessory": "Acoustic resonance micro-viol",
                "zone": "Neon Concert Amphitheater",
                "pos": [-120.0, 6.5, 118.0],
                "activity": "Harmonizing soundscapes for evening holographic light festival"
            },
            {
                "name": "Agriculture Robot",
                "height_m": 0.33,
                "color_primary": "Sage Green & Bronze",
                "glow": "Chlorophyll laser scanner",
                "accessory": "Seed dispersal pods & drone tether",
                "zone": "Green Agriculture Fields",
                "pos": [-148.0, 4.5, -78.0],
                "activity": "Optimizing aeroponic nutrient mist in vertical farming towers"
            },
            {
                "name": "Travel Robot",
                "height_m": 0.30,
                "color_primary": "Ruggedized Olive",
                "glow": "Terrain LiDAR scanner",
                "accessory": "Expedition backpack with bedroll, miniature hiking boots",
                "zone": "Tech City Boulevard (Walking Quartet)",
                "pos": [0.15, 0.05, 54.5],
                "activity": "Walking alongside Explorer heading toward Maglev Central Station"
            },
            {
                "name": "Sports Robot",
                "height_m": 0.30,
                "color_primary": "Carbon Weave",
                "glow": "Neon kinetic trails",
                "accessory": "Aerodynamic streamline servos",
                "zone": "Sports Arena Kinetic Track",
                "pos": [-218.0, 5.5, 32.0],
                "activity": "Calibrating holographic hurdles and sprinting agility loops"
            },
            {
                "name": "Cooking Robot",
                "height_m": 0.25,
                "color_primary": "Stainless Steel & White",
                "glow": "Infrared induction fingertips",
                "accessory": "Chef toque visor & recipe interface",
                "zone": "Tech City Boulevard Café",
                "pos": [-10.0, 0.15, 42.0],
                "activity": "Preparing molecular gastronomic dishes for urban workers"
            },
            {
                "name": "Teaching Robot",
                "height_m": 0.28,
                "color_primary": "Warm Ivory/Copper",
                "glow": "Orbiting lesson spheres",
                "accessory": "Holographic laser pointer",
                "zone": "Global Learning University",
                "pos": [82.0, 6.0, -118.0],
                "activity": "Delivering holographic lectures on multi-disciplinary robotics"
            },
            {
                "name": "Communication Robot",
                "height_m": 0.30,
                "color_primary": "Turquoise & Chrome",
                "glow": "Dynamic soundwave LED chest equalizer",
                "accessory": "Directional micro-microphone in hand",
                "zone": "Tech City Boulevard (Walking Quartet)",
                "pos": [-0.5, 0.05, 55.4],
                "activity": "Walking ahead of Explorer broadcasting live commentary toward Maglev Station"
            }
        ]
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[Skillverse Generator] Manifest successfully saved to {output_path}")
    print(f"Total Zones: {len(manifest['zones'])}")
    print(f"Total Skill Robots: {len(manifest['skill_robots'])}")
    print("Camera Keyframes: 9 spline points across 10.00 seconds continuous trajectory.")
    return manifest

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    target = os.path.join(out_dir, "skillverse_scene_manifest.json")
    generate_skillverse_scene_manifest(target)
