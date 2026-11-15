/**
 * Zone Micro-Interactions & Mini-Activities (Medium 5)
 * 1. Tech City: Holographic syntax terminal mini-puzzle
 * 2. Art District: Virtual laser spray-paint tool on arcology mural
 * 3. Sports Arena: 100m sprint timer alongside Athletic Humanoid
 */
export class ZoneInteractions {
  constructor(app) {
    this.app = app;

    // Tech City Terminal Puzzle State
    this.terminalSolved = false;
    this.terminalCode = `function optimizeGrid(nodes) {
  return nodes.filter(n => n.active).reduce((sum, n) => sum + n.mw, 0);
}`;

    // Sports Arena Sprint State
    this.sprintRunning = false;
    this.sprintStartTime = 0;
    this.sprintElapsed = 0;
    this.sprintBestTime = 10.42;

    // Art District Spray Tool
    this.activeSprayColor = '#00f0ff';
  }

  // 1. Tech City Terminal Puzzle
  solveTerminalPuzzle(userAnswer) {
    const isCorrect = userAnswer.trim().includes('reduce') || userAnswer.trim().includes('sum + n.mw');
    if (isCorrect) {
      this.terminalSolved = true;
      if (this.app && typeof this.app.showToast === 'function') {
        this.app.showToast('✅ TECH CITY TERMINAL SOLVED: QUANTUM SMART GRID SYNCHRONIZED!');
      }
      return true;
    }
    return false;
  }

  // 2. Sports Arena 100m Sprint Timer
  startSprint() {
    this.sprintRunning = true;
    this.sprintStartTime = performance.now();
    return true;
  }

  stopSprint() {
    if (!this.sprintRunning) return this.sprintElapsed;
    this.sprintRunning = false;
    this.sprintElapsed = (performance.now() - this.sprintStartTime) / 1000;
    if (this.sprintElapsed < this.sprintBestTime) {
      this.sprintBestTime = this.sprintElapsed;
    }
    if (this.app && typeof this.app.showToast === 'function') {
      this.app.showToast(`🏁 SPRINT FINISHED: ${this.sprintElapsed.toFixed(2)}s (Best: ${this.sprintBestTime.toFixed(2)}s)`);
    }
    return this.sprintElapsed;
  }

  resetSprint() {
    this.sprintRunning = false;
    this.sprintElapsed = 0;
  }

  // 3. Art District Virtual Spray Paint
  setSprayColor(hex) {
    this.activeSprayColor = hex;
    return this.activeSprayColor;
  }

  sprayGraffiti(x = -120, y = 2.5, z = 120) {
    const artDistrict = this.app?.worldManager?.zones?.artDistrict;
    if (artDistrict && typeof artDistrict.addGraffitiDecal === 'function') {
      const decal = artDistrict.addGraffitiDecal(x + 120, y - 5, z - 120, this.activeSprayColor);
      if (this.app?.showToast) {
        this.app.showToast(`🎨 ART DISTRICT: Neon graffiti applied in ${this.activeSprayColor.toUpperCase()}!`);
      }
      return decal;
    }
    return null;
  }

  // 4. Space Launch Base: Countdown & Orbital Rocket Launch Sequence (Major 3)
  triggerRocketLaunch() {
    const spaceBase = this.app?.worldManager?.zones?.spaceBase;
    if (spaceBase && typeof spaceBase.launch === 'function') {
      spaceBase.launch();
      if (this.app?.showToast) {
        this.app.showToast('🚀 SPACE LAUNCH BASE: Cryogenic venting active! Ignition confirmed, liftoff into stratosphere!');
      }
      return true;
    }
    return false;
  }

  // 5. Autonomous Maglev Transit Interior Cab Ride (Medium 1)
  toggleTransitCabRide(camera = null) {
    const transit = this.app?.worldManager?.transit;
    if (!transit) return false;
    const targetCam = camera || this.app?.camera;
    if (transit.isPlayerRiding) {
      transit.exitTrain();
      if (this.app?.showToast) this.app.showToast('🚊 MAGLEV TRANSIT: Exited cab view.');
      return false;
    } else {
      transit.boardTrain(targetCam);
      if (this.app?.showToast) this.app.showToast('🚊 MAGLEV TRANSIT: Boarded front cab! Panoramic windshield view active.');
      return true;
    }
  }

  // 6. Ancient Ruins Interactive Laser Restoration Grid (Medium 2)
  solveRuinsLaserPuzzle() {
    const ruins = this.app?.worldManager?.zones?.ruins;
    if (ruins && typeof ruins.alignMirrors === 'function') {
      ruins.alignMirrors();
      if (this.app?.showToast) {
        this.app.showToast('🏛️ ANCIENT RUINS: Laser grid aligned! Golden temple holographic restoration activated.');
      }
      return true;
    }
    return false;
  }

  // 7. Underwater Submarine Dive Mode (Major 2)
  toggleSubmarineDive() {
    const ocean = this.app?.worldManager?.zones?.ocean;
    if (ocean && typeof ocean.toggleDive === 'function') {
      const isDiving = ocean.toggleDive();
      if (this.app?.showToast) {
        this.app.showToast(isDiving ? '🌊 OCEAN COAST: Submersible descending to seabed caustics layer!' : '🌊 OCEAN COAST: Submersible surfacing to research dock.');
      }
      return isDiving;
    }
    return false;
  }
}
