import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Scene Manifest: Validates complete planetary dataset', () => {
  const manifestPath = path.resolve('pipeline/skillverse_scene_manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'pipeline/skillverse_scene_manifest.json must exist');

  const content = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // World Metadata
  assert.equal(content.world_name, 'Skillverse');
  assert.equal(content.scale_convention.explorer_miniature_height_m, 0.38);
  assert.equal(content.scale_convention.planet_radius_m, 800.0);

  // Cinematic 24mm Master Sequence
  assert.equal(content.cinematic_flythrough.total_duration_seconds, 10.0);
  assert.equal(content.cinematic_flythrough.aspect_ratio, '16:9 Widescreen (Native)');
  assert.equal(content.cinematic_flythrough.camera_spline_keyframes.length, 9);
  content.cinematic_flythrough.camera_spline_keyframes.forEach(kf => {
    assert.equal(kf.fov, 73.74, 'Every keyframe must use 73.74 deg FOV for 24mm fixed lens');
  });

  // Zones
  assert.equal(content.zones.length, 12, 'Must contain all 12 living zones');

  // Skill Robots
  assert.equal(content.skill_robots.length, 18, 'Must contain all 18 skill robots');
});
