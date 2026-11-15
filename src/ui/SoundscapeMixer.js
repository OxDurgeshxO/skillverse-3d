/**
 * Interactive Soundscape Equalizer Mixer (Medium 3)
 * Manages 6 independent ambient audio channels:
 * Wind, City Hum, Transit, Waterfalls, Robot Vocals, and Synth Ambient.
 */
export class SoundscapeMixer {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.channels = {
      wind: 0.85,
      city: 0.75,
      transit: 0.80,
      waterfall: 0.60,
      robot: 0.90,
      synth: 0.70
    };
    this.isOpen = false;
  }

  setVolume(channel, volume) {
    if (this.channels[channel] !== undefined) {
      this.channels[channel] = Math.max(0.0, Math.min(1.0, parseFloat(volume) || 0.0));
      if (this.audioEngine && typeof this.audioEngine.setChannelVolume === 'function') {
        this.audioEngine.setChannelVolume(channel, this.channels[channel]);
      }
      return this.channels[channel];
    }
    return 0.0;
  }

  getVolume(channel) {
    return this.channels[channel] ?? 0.0;
  }

  getChannels() {
    return { ...this.channels };
  }

  toggleUI() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('soundscape-modal');
    if (!modal) return;
    this.isOpen = !this.isOpen;
    modal.classList.toggle('visible', this.isOpen);
  }
}
