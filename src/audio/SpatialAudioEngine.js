export class SpatialAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.windNode = null;
    this.cityHumNode = null;
    this.subRumbleNode = null;
    this.robotChirpNode = null;
    this.masterGain = null;
    this.isInitialized = false;
    this.positionalSources = [];
    this.lastFootstepTime = 0;
  }

  init() {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initWindGenerator();
      this.initCityHum();
      this.initSubRumble();

      this.isInitialized = true;
      this.isMuted = false;
      this.masterGain.gain.setTargetAtTime(0.4, this.ctx.currentTime, 0.5);
    } catch (err) {
      console.warn('SpatialAudioEngine initialization prevented:', err);
    }
  }

  initWindGenerator() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(600, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    whiteNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    whiteNoise.start(0);
  }

  initCityHum() {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(112, this.ctx.currentTime);

    this.cityFilter = this.ctx.createBiquadFilter();
    this.cityFilter.type = 'lowpass';
    this.cityFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.cityGain = this.ctx.createGain();
    this.cityGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    osc1.connect(this.cityFilter);
    osc2.connect(this.cityFilter);
    this.cityFilter.connect(this.cityGain);
    this.cityGain.connect(this.masterGain);

    osc1.start(0);
    osc2.start(0);
  }

  initSubRumble() {
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(42, this.ctx.currentTime);

    this.rumbleGain = this.ctx.createGain();
    this.rumbleGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    osc.connect(this.rumbleGain);
    this.rumbleGain.connect(this.masterGain);
    osc.start(0);
  }

  /**
   * Multi-formant robotic vocal speech synthesizer
   * Synthesizes 3-syllable expressive robotic speech bursts with formant filters
   */
  speakRobotVocal(skillType = 'coding') {
    if (!this.isInitialized || this.isMuted) return;

    let baseFreq = 160;
    let waveType = 'square';

    if (skillType === 'ai_ml') {
      baseFreq = 230;
      waveType = 'sine';
    } else if (skillType === 'engineering') {
      baseFreq = 135;
      waveType = 'sawtooth';
    } else if (skillType === 'medicine') {
      baseFreq = 210;
      waveType = 'triangle';
    } else if (skillType === 'music') {
      baseFreq = 262;
      waveType = 'sine';
    } else if (skillType === 'space') {
      baseFreq = 175;
      waveType = 'sawtooth';
    } else if (skillType === 'art') {
      baseFreq = 295;
      waveType = 'triangle';
    } else if (skillType === 'writing') {
      baseFreq = 190;
      waveType = 'square';
    } else if (skillType === 'finance') {
      baseFreq = 145;
      waveType = 'sawtooth';
    } else if (skillType === 'cooking') {
      baseFreq = 220;
      waveType = 'sine';
    } else if (skillType === 'sports') {
      baseFreq = 120;
      waveType = 'square';
    } else if (skillType === 'teaching') {
      baseFreq = 240;
      waveType = 'triangle';
    } else if (skillType === 'law') {
      baseFreq = 150;
      waveType = 'sawtooth';
    } else if (skillType === 'agriculture') {
      baseFreq = 165;
      waveType = 'triangle';
    } else if (skillType === 'photography') {
      baseFreq = 275;
      waveType = 'sine';
    } else {
      baseFreq = 160;
      waveType = 'square';
    }

    const syllables = 3;
    const now = this.ctx.currentTime;

    for (let i = 0; i < syllables; i++) {
      const startTime = now + i * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = waveType;

      // Pitch inflection
      const pitchMod = (i === 1) ? 1.25 : (i === 2) ? 1.1 : 1.0;
      osc.frequency.setValueAtTime(baseFreq * pitchMod, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * pitchMod * 1.05, startTime + 0.08);

      // Formant Filter F1 (vowel resonance)
      const f1 = this.ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.Q.value = 5.0;
      f1.frequency.setValueAtTime((i % 2 === 0) ? 650 : 400, startTime);

      // Formant Filter F2
      const f2 = this.ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.Q.value = 4.0;
      f2.frequency.setValueAtTime((i % 2 === 0) ? 1800 : 1200, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(gain);
      f2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  }

  playRobotChirp() {
    this.speakRobotVocal('coding');
  }

  /**
   * Update Web Audio 3D listener position & orientation based on Three.js camera
   */
  updateListener(camera) {
    if (!this.isInitialized || !this.ctx || !this.ctx.listener || !camera) return;

    try {
      const p = camera.position;
      const listener = this.ctx.listener;
      const now = this.ctx.currentTime;

      if (listener.positionX) {
        listener.positionX.setTargetAtTime(p.x, now, 0.05);
        listener.positionY.setTargetAtTime(p.y, now, 0.05);
        listener.positionZ.setTargetAtTime(p.z, now, 0.05);
      } else if (typeof listener.setPosition === 'function') {
        listener.setPosition(p.x, p.y, p.z);
      }

      // Forward vector and Up vector in world space
      if (typeof camera.getWorldDirection === 'function') {
        const forward = camera.getWorldDirection(new (camera.position.constructor)());
        let upVec = camera.up || { x: 0, y: 1, z: 0 };
        if (camera.quaternion && typeof camera.quaternion.clone === 'function') {
          upVec = (new (camera.position.constructor)(0, 1, 0)).applyQuaternion(camera.quaternion);
        }
        if (listener.forwardX) {
          listener.forwardX.setTargetAtTime(forward.x, now, 0.05);
          listener.forwardY.setTargetAtTime(forward.y, now, 0.05);
          listener.forwardZ.setTargetAtTime(forward.z, now, 0.05);
          listener.upX.setTargetAtTime(upVec.x, now, 0.05);
          listener.upY.setTargetAtTime(upVec.y, now, 0.05);
          listener.upZ.setTargetAtTime(upVec.z, now, 0.05);
        } else if (typeof listener.setOrientation === 'function') {
          listener.setOrientation(forward.x, forward.y, forward.z, upVec.x, upVec.y, upVec.z);
        }
      }
    } catch (err) {
      // Audio listener update non-fatal guard
    }
  }

  /**
   * Create a 3D Positional PannerNode for dynamic sound emitters (maglev, waterfall, robots)
   */
  createPositionalSource({ refDistance = 4.0, maxDistance = 100.0, rolloffFactor = 1.0 } = {}) {
    if (!this.isInitialized || !this.ctx) {
      return {
        setPosition: () => {},
        gain: null,
        panner: null
      };
    }

    try {
      const panner = this.ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = refDistance;
      panner.maxDistance = maxDistance;
      panner.rolloffFactor = rolloffFactor;

      const sourceGain = this.ctx.createGain();
      sourceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      sourceGain.connect(panner);
      panner.connect(this.masterGain);

      const sourceObj = {
        panner,
        gain: sourceGain,
        setPosition: (x, y, z) => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          if (panner.positionX) {
            panner.positionX.setTargetAtTime(x, t, 0.05);
            panner.positionY.setTargetAtTime(y, t, 0.05);
            panner.positionZ.setTargetAtTime(z, t, 0.05);
          } else if (typeof panner.setPosition === 'function') {
            panner.setPosition(x, y, z);
          }
        }
      };

      this.positionalSources.push(sourceObj);
      return sourceObj;
    } catch (e) {
      return {
        setPosition: () => {},
        gain: null,
        panner: null
      };
    }
  }

  /**
   * Procedural FM surface footstep synthesizer
   * Surfaces: 'asphalt' (crisp crunch), 'metal' (hollow clank), 'grass' (soft rustle), 'water' (splash)
   */
  playFootstep(surface = 'asphalt', position = null) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (now - this.lastFootstepTime < 0.12) return; // Debounce rapid triggers
      this.lastFootstepTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      let targetFreq = 120;
      let duration = 0.08;
      let filterFreq = 1800;

      if (surface === 'metal') {
        osc.type = 'triangle';
        targetFreq = 340;
        duration = 0.12;
        filterFreq = 3200;
      } else if (surface === 'grass') {
        osc.type = 'sine';
        targetFreq = 85;
        duration = 0.06;
        filterFreq = 900;
      } else if (surface === 'water') {
        osc.type = 'sine';
        targetFreq = 220;
        duration = 0.14;
        filterFreq = 1400;
      } else {
        // asphalt
        osc.type = 'sawtooth';
        targetFreq = 110;
        duration = 0.07;
        filterFreq = 2000;
      }

      osc.frequency.setValueAtTime(targetFreq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq * 0.7, now + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.Q.value = 3.5;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);

      if (position && this.createPositionalSource) {
        const panner = this.ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 2.0;
        panner.maxDistance = 50.0;
        if (panner.positionX) {
          panner.positionX.setValueAtTime(position.x || 0, now);
          panner.positionY.setValueAtTime(position.y || 0, now);
          panner.positionZ.setValueAtTime(position.z || 0, now);
        } else if (typeof panner.setPosition === 'function') {
          panner.setPosition(position.x || 0, position.y || 0, position.z || 0);
        }
        gain.connect(panner);
        panner.connect(this.masterGain);
      } else {
        gain.connect(this.masterGain);
      }

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {
      // Audio synth non-fatal guard
    }
  }

  /**
   * Set global master volume [0.0 - 1.0]
   */
  setMasterVolume(val = 0.4) {
    this.masterVolume = Math.max(0.0, Math.min(1.0, Number(val) || 0.0));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Toggle global audio mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : (this.masterVolume ?? 0.4);
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * Synthesize Doppler Maglev Transit Whoosh with distance culling
   */
  playMaglevWhoosh(position = null, cameraPosition = null) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;

    // Fix 8: Distance culling beyond 120 meters
    if (position && cameraPosition) {
      const dx = position.x - cameraPosition.x;
      const dy = position.y - cameraPosition.y;
      const dz = position.z - cameraPosition.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq > 14400) return; // 120m threshold
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      // Doppler downward glide: 340 Hz -> 160 Hz
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.6);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      // Guard
    }
  }

  update(timelineSeconds, altitude, camera = null) {
    if (!this.isInitialized || this.isMuted) return;
    if (camera) this.updateListener(camera);

    const t = timelineSeconds;
    if (t < 2.5) {
      const p1 = 1.0 - t / 2.5;
      this.windGain.gain.setTargetAtTime(0.6 * p1 + 0.2, this.ctx.currentTime, 0.1);
      this.cityGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.1);
      this.rumbleGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);
    } else if (t < 5.5) {
      this.windGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 0.1);
      this.cityGain.gain.setTargetAtTime(0.4, this.ctx.currentTime, 0.1);
      this.rumbleGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.1);
    } else if (t < 8.0) {
      this.windGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.1);
      this.cityGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.1);
      this.rumbleGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);

      if (Math.random() < 0.025) {
        this.speakRobotVocal('ai_ml');
      }
    } else {
      const p4 = (t - 8.0) / 2.0;
      this.windGain.gain.setTargetAtTime(0.35 * p4, this.ctx.currentTime, 0.1);
      this.cityGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 0.1);
      this.rumbleGain.gain.setTargetAtTime(0.55 * p4, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Fix 7: Idle Audio Node Disconnection & AudioContext Suspension (GC Protection)
   */
  toggle() {
    if (!this.isInitialized) {
      this.init();
      return true;
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0.0 : 0.4, this.ctx.currentTime, 0.1);
      if (this.isMuted) {
        // Suspend context when muted to save audio thread processing
        setTimeout(() => {
          if (this.isMuted && this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        }, 300);
      } else {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }
    }
    return !this.isMuted;
  }
}
