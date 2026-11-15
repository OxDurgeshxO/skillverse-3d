import * as THREE from 'three';

/**
 * SkillverseCoordinator: Master Engine Event Bus & World Orchestrator
 * Unifies all 12 zones, 18 robots, transit systems, physical shaders, and audio engine.
 */
export class SkillverseCoordinator {
  constructor(app) {
    this.app = app;
    this.listeners = new Map();
    this.state = {
      currentTime: 0.0,
      cameraMode: 'cinematic',
      isFestivalActive: false,
      activeZone: 'tech_city',
      selectedRobot: null,
      weather: 'post_rain_golden_hour',
      sunElevationDeg: 14.0
    };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[Coordinator Error] Event '${event}':`, err);
        }
      });
    }
  }

  setTime(time) {
    this.state.currentTime = time;
    this.emit('time_update', time);
  }

  setCameraMode(mode) {
    this.state.cameraMode = mode;
    this.emit('camera_mode_change', mode);
  }

  toggleFestival() {
    this.state.isFestivalActive = !this.state.isFestivalActive;
    this.emit('festival_toggle', this.state.isFestivalActive);
    return this.state.isFestivalActive;
  }

  selectRobot(robotId) {
    this.state.selectedRobot = robotId;
    this.emit('robot_selected', robotId);
  }

  triggerRobotSpeech(robotId, query) {
    this.emit('robot_speech', { robotId, query });
  }

  update(delta, time) {
    this.emit('tick', { delta, time });
  }
}
