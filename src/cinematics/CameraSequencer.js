import * as THREE from 'three';

/**
 * CameraSequencer: 10-Second Continuous Crane-Down Shot (16:9, Fixed 24mm Lens)
 * - 0.0s to 4.0s: Slow aerial drone descent through volumetric clouds above miniature planet (mountain range & sea on horizon).
 * - 4.0s to 10.0s: Forward glide over Tech City glass towers, settling at street level behind explorer & 3 robots as maglev glides in.
 */
export class CameraSequencer {
  constructor(camera) {
    this.camera = camera;
    this.duration = 10.0;
    this.currentTime = 0.0;
    this.isPlaying = true;
    this.speed = 1.0;

    // Fixed 24mm ultra-wide lens profile (Horizontal FOV ~73.74°, Vertical FOV ~45.3° at 16:9)
    this.focalLength24mmFov = 73.74;
    this.camera.fov = this.focalLength24mmFov;
    this.camera.updateProjectionMatrix();

    // Spline trajectory: High drone -> Cloud penetration -> City glide -> Settles behind explorer
    this.positionSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 850, -420),     // 0.0s: High Aerial Drone shot above miniature world
      new THREE.Vector3(-10, 520, -320),   // 1.8s: Upper cloud layer, horizon mountains & sea visible
      new THREE.Vector3(0, 240, -180),     // 3.2s: Descending through volumetric cloud deck
      new THREE.Vector3(0, 110, -90),      // 4.0s: Clearing cloud base, forward glide over Tech City
      new THREE.Vector3(-0.4, 32, -15),    // 5.8s: Skimming over glass towers and smart roads
      new THREE.Vector3(-0.5, 8.5, 25),    // 7.2s: Descending into boulevard canyon
      new THREE.Vector3(-0.5, 1.4, 46),    // 8.5s: Reaching street level behind walking group
      new THREE.Vector3(-0.5, 0.55, 50.8), // 9.5s: Settling at street level behind Explorer
      new THREE.Vector3(-0.5, 0.52, 51.5)  // 10.0s: Final resting position behind Explorer
    ]);
    this.positionSpline.curveType = 'catmullrom';
    this.positionSpline.tension = 0.5;

    // Look-at target trajectory: horizon -> Tech City -> Street group & arriving maglev train ahead
    this.targetSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 60, 40),        // 0.0s: Looking down toward miniature planet & horizon
      new THREE.Vector3(0, 35, 40),        // 2.0s: Centering Tech City through cloud openings
      new THREE.Vector3(0, 20, 45),        // 4.0s: Gliding toward glass towers
      new THREE.Vector3(-0.5, 8, 55),      // 6.0s: Tracking toward boulevard & maglev station
      new THREE.Vector3(-0.5, 0.7, 56),    // 7.5s: Focusing ahead on Explorer & 3 robots
      new THREE.Vector3(-0.5, 0.45, 60),   // 8.8s: Tracking quartet walking toward station
      new THREE.Vector3(-0.5, 1.2, 68),    // 9.6s: Looking through group to sleek maglev gliding in
      new THREE.Vector3(-0.5, 1.4, 70)     // 10.0s: Maglev train gliding slowly into station platform
    ]);
    this.targetSpline.curveType = 'catmullrom';
    this.targetSpline.tension = 0.5;

    this._pos = new THREE.Vector3();
    this._target = new THREE.Vector3();
  }

  update(delta) {
    if (!this.isPlaying) return;

    this.currentTime += delta * this.speed;
    if (this.currentTime >= this.duration) {
      this.currentTime = 0.0;
    }

    this.seek(this.currentTime);
  }

  seek(t) {
    this.currentTime = Math.max(0.0, Math.min(this.duration, t));
    const alpha = this.currentTime / this.duration;

    this.positionSpline.getPoint(alpha, this._pos);
    this.targetSpline.getPoint(alpha, this._target);

    this.camera.position.copy(this._pos);
    this.camera.lookAt(this._target);

    // Constant 24mm lens profile (fixed FOV)
    this.camera.fov = this.focalLength24mmFov;
    this.camera.updateProjectionMatrix();
  }

  getPhaseInfo() {
    const t = this.currentTime;
    if (t < 4.0) {
      return {
        id: 1,
        title: 'PHASE 1: AERIAL CLOUD DESCENT (0–4S, 24MM)',
        zone: 'MINIATURE PLANET HORIZON',
        altitude: `${Math.round(this.camera.position.y)} M`
      };
    } else {
      return {
        id: 2,
        title: 'PHASE 2: CITY GLIDE & STREET SETTLE (4–10S, 24MM)',
        zone: 'TECH CITY BOULEVARD',
        altitude: this.camera.position.y < 2 ? `${(this.camera.position.y * 100).toFixed(0)} CM` : `${Math.round(this.camera.position.y)} M`
      };
    }
  }
}
