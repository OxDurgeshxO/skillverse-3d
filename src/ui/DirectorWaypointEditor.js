import * as THREE from 'three';

/**
 * Cinematic Director Waypoint Editor (Medium 1)
 * Interactive camera trajectory path editor supporting custom spline waypoints,
 * focal length optical profiles (18mm, 24mm, 35mm, 50mm, 85mm), duration curves,
 * and JSON import/export.
 */
export class DirectorWaypointEditor {
  constructor(app) {
    this.app = app;
    this.waypoints = [
      { id: 1, pos: [0, 480, -280], target: [0, 15, 60], duration: 4.0, focal: 24, name: 'Stratosphere Descent' },
      { id: 2, pos: [0, 60, -30], target: [0, 20, 20], duration: 3.0, focal: 24, name: 'Tech City Central' },
      { id: 3, pos: [0, 1.8, 62], target: [0, 1.4, 70], duration: 3.0, focal: 24, name: 'Station Platform' }
    ];

    this.isPlaying = false;
    this.playbackTime = 0;
    this.totalDuration = 10.0;
    this.spline = null;
    this.rebuildSpline();
  }

  addWaypoint(pos, target, duration = 3.0, focal = 24, name = 'New Waypoint') {
    const id = Date.now();
    const wp = {
      id,
      pos: [Math.round(pos.x), Math.round(pos.y), Math.round(pos.z)],
      target: [Math.round(target.x), Math.round(target.y), Math.round(target.z)],
      duration,
      focal,
      name
    };
    this.waypoints.push(wp);
    this.rebuildSpline();
    return wp;
  }

  removeWaypoint(id) {
    this.waypoints = this.waypoints.filter(w => w.id !== id);
    this.rebuildSpline();
  }

  rebuildSpline() {
    if (this.waypoints.length < 2) {
      this.spline = null;
      return;
    }
    const points = this.waypoints.map(w => new THREE.Vector3(...w.pos));
    this.spline = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    this.totalDuration = this.waypoints.reduce((acc, w) => acc + (w.duration || 3.0), 0);
  }

  exportToJSON() {
    return JSON.stringify({
      version: '1.0.0',
      totalDuration: this.totalDuration,
      waypoints: this.waypoints
    }, null, 2);
  }

  importFromJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.waypoints)) {
        this.waypoints = data.waypoints;
        this.rebuildSpline();
        return true;
      }
    } catch (e) {
      console.warn('[DirectorWaypointEditor] Invalid JSON import format:', e);
    }
    return false;
  }

  evaluate(progress) {
    // progress in [0, 1]
    if (!this.spline) return null;
    const clamped = Math.max(0, Math.min(1, progress));
    const pos = this.spline.getPointAt(clamped);

    // Interpolate target
    const numSegments = this.waypoints.length - 1;
    const segIdx = Math.min(numSegments - 1, Math.floor(clamped * numSegments));
    const segT = (clamped * numSegments) - segIdx;

    const t0 = new THREE.Vector3(...this.waypoints[segIdx].target);
    const t1 = new THREE.Vector3(...this.waypoints[segIdx + 1].target);
    const target = t0.clone().lerp(t1, segT);

    const focal = this.waypoints[segIdx].focal || 24;
    return { pos, target, focal };
  }

  /**
   * 3D Visual Spline Gizmos (Medium 1)
   * Renders in-scene 3D waypoint node markers and trajectory spline curve
   */
  createGizmos(scene) {
    if (!scene) return null;
    if (this.gizmoGroup) {
      scene.remove(this.gizmoGroup);
    }
    this.gizmoGroup = new THREE.Group();
    this.gizmoGroup.name = 'director_spline_gizmos';

    if (this.spline) {
      const curvePoints = this.spline.getPoints(60);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      this.gizmoGroup.add(curveLine);
    }

    const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
    this.waypoints.forEach((wp, idx) => {
      const mat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x10b981 : idx === this.waypoints.length - 1 ? 0xf43f5e : 0x00f0ff,
        wireframe: true
      });
      const marker = new THREE.Mesh(sphereGeo, mat);
      marker.position.set(...wp.pos);
      marker.userData = { waypointId: wp.id, index: idx };
      this.gizmoGroup.add(marker);
    });

    scene.add(this.gizmoGroup);
    return this.gizmoGroup;
  }

  toggleGizmos(scene, visible = true) {
    if (this.gizmoGroup) {
      this.gizmoGroup.visible = visible;
    } else if (visible && scene) {
      this.createGizmos(scene);
    }
  }

  /**
   * Small 2: Cinematic Optical Lens Presets (18mm - 85mm)
   */
  setLensPreset(focalLengthMm, camera = null) {
    const validLenses = {
      18: { name: '18mm Super-Wide', fov: 67.4, dof: 0.1 },
      24: { name: '24mm Cinematic Prime', fov: 53.1, dof: 0.2 },
      35: { name: '35mm Street Documentary', fov: 37.8, dof: 0.35 },
      50: { name: '50mm Natural Prime', fov: 27.0, dof: 0.55 },
      85: { name: '85mm Portrait Telephoto', fov: 16.1, dof: 0.85 }
    };
    const lens = validLenses[focalLengthMm] || validLenses[24];
    this.activeLens = lens;
    if (camera) {
      camera.fov = lens.fov;
      camera.updateProjectionMatrix();
    }
    return lens;
  }
}
