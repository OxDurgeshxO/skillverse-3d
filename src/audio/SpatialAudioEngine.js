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

  update(timelineSeconds, altitude) {
    if (!this.isInitialized || this.isMuted) return;

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

  toggle() {
    if (!this.isInitialized) {
      this.init();
      return true;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0.0 : 0.4, this.ctx.currentTime, 0.1);
    }
    return !this.isMuted;
  }
}
