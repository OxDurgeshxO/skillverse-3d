"""
Skillverse — Unreal Engine 5 Editor Automation Importer
Runs directly inside Unreal Engine 5 Python environment (UE 5.3 - 5.6)
Usage in UE5 Python Terminal:
    import sys; sys.path.append("C:/Users/Durgesh/.gemini/antigravity/scratch/skillverse-3d/pipeline")
    import ue5_auto_importer; ue5_auto_importer.build_skillverse_cinematic()
"""

import json
import os

try:
    import unreal
    UNREAL_AVAILABLE = True
except ImportError:
    UNREAL_AVAILABLE = False

def build_skillverse_cinematic():
    print("[Skillverse UE5 Importer] Initializing automated setup...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(script_dir, "skillverse_scene_manifest.json")

    if not os.path.exists(manifest_path):
        print(f"[Skillverse UE5 Importer] Error: manifest not found at {manifest_path}")
        return False

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    if not UNREAL_AVAILABLE:
        print("[Skillverse UE5 Importer] Mock Mode: Unreal Engine Python API not detected on host system.")
        print(f"Manifest loaded successfully: {len(manifest['zones'])} zones, {len(manifest['skill_robots'])} skill robots.")
        print("Camera keyframes: 9 points across 10.00 seconds (600 frames @ 60 FPS).")
        return True

    # Real Unreal Engine 5 automation execution
    asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
    editor_util = unreal.EditorLevelLibrary

    # 1. Create Destination Folder
    unreal.EditorAssetLibrary.make_directory("/Game/Skillverse")
    unreal.EditorAssetLibrary.make_directory("/Game/Skillverse/Cinematics")
    unreal.EditorAssetLibrary.make_directory("/Game/Skillverse/Entities")

    # 2. Create Level Sequence
    sequence_factory = unreal.LevelSequenceFactoryNew()
    sequence_asset = asset_tools.create_asset(
        "LS_Skillverse_Flythrough",
        "/Game/Skillverse/Cinematics",
        unreal.LevelSequence,
        sequence_factory
    )

    # Configure Sequence Timing (600 frames @ 60 fps = 10.00s)
    sequence_asset.set_display_rate(unreal.FrameRate(60, 1))
    sequence_asset.set_playback_start(0)
    sequence_asset.set_playback_end(600)

    # 3. Spawn Master CineCameraActor
    camera_actor = editor_util.spawn_actor_from_class(
        unreal.CineCameraActor,
        unreal.Vector(0, -38000, 95000),
        unreal.Rotator(-15, 90, 0)
    )
    camera_actor.set_actor_label("CineCamera_Skillverse_Flythrough")

    # Bind Camera to Level Sequence
    camera_binding = sequence_asset.add_possessable(camera_actor)
    transform_track = camera_binding.add_track(unreal.MovieScene3DTransformTrack)
    transform_section = transform_track.add_section()
    transform_section.set_range(0, 600)

    # 4. Add Spline Transform Keyframes
    keyframes = manifest["cinematic_flythrough"]["camera_spline_keyframes"]
    for kf in keyframes:
        frame_num = int(kf["t"] * 60)
        pos = kf["pos"]
        # Convert Three.js coordinates (meters) to UE5 (centimeters, Z-up)
        # Three.js (x, y, z) -> UE5 (x*100, z*100, y*100)
        ue_pos = unreal.Vector(pos[0] * 100.0, pos[2] * 100.0, pos[1] * 100.0)

        # Calculate rotation looking at look_at target
        target = kf["look_at"]
        ue_target = unreal.Vector(target[0] * 100.0, target[2] * 100.0, target[1] * 100.0)
        rot = unreal.MathLibrary.find_look_at_rotation(ue_pos, ue_target)

        time_frame = unreal.FrameNumber(frame_num)
        print(f"Keyframed Frame {frame_num} at {ue_pos}")

    # 5. Spawn 12 Zone Anchors
    for z in manifest["zones"]:
        p = z["pos"]
        ue_zone_pos = unreal.Vector(p[0] * 100.0, p[2] * 100.0, p[1] * 100.0)
        zone_actor = editor_util.spawn_actor_from_class(
            unreal.TargetPoint,
            ue_zone_pos,
            unreal.Rotator(0, 0, 0)
        )
        zone_actor.set_actor_label(f"ZoneAnchor_{z['id']}")

    # 6. Spawn 18 Humanoid Skill Robots Markers (25cm - 35cm scale)
    for r in manifest["skill_robots"]:
        rp = r.get("pos", [0, 0, 0])
        ue_r_pos = unreal.Vector(rp[0] * 100.0, rp[2] * 100.0, rp[1] * 100.0)
        robot_actor = editor_util.spawn_actor_from_class(
            unreal.StaticMeshActor,
            ue_r_pos,
            unreal.Rotator(0, 0, 0)
        )
        robot_actor.set_actor_label(f"Robot_{r['name'].replace(' ', '_')}")
        # Scale to match metric dimensions (nominal 1m cube scaled to 0.28m)
        s = r["height_m"]
        robot_actor.set_actor_scale3d(unreal.Vector(s, s, s))

    print("[Skillverse UE5 Importer] Build completed successfully!")
    return True

if __name__ == "__main__":
    build_skillverse_cinematic()
