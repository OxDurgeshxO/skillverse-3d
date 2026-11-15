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
}
