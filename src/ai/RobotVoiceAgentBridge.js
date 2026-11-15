import { escapeHTML } from '../main.js';

/**
 * RobotVoiceAgentBridge: Real-Time Multimodal LLM Voice & Knowledge Bridge
 * Connects speech recognition, autonomous robot reasoning, and multi-formant vocal audio synthesis.
 */
export class RobotVoiceAgentBridge {
  constructor(audioEngine, app) {
    this.audioEngine = audioEngine;
    this.app = app;
    this.isListening = false;
    this.recognition = null;
    this.wsConnection = null;

    if (typeof window !== 'undefined') {
      this.initSpeechRecognition();
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicUI(true);
        if (this.app?.showToast) {
          this.app.showToast('🎙 VOICE LISTENING: SPEAK YOUR INQUIRY TO SKILL ROBOT...');
        }
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.handleUserVoiceInput(transcript);
      };

      this.recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        this.isListening = false;
        this.updateMicUI(false);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicUI(false);
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization prevented:', e);
    }
  }

  toggleListening() {
    if (!this.recognition) {
      if (this.app?.showToast) {
        this.app.showToast('VOICE INPUT: SPEECH RECOGNITION NOT SUPPORTED IN THIS BROWSER (USE TEXT CHAT)');
      }
      return false;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
    this.updateMicUI(this.isListening);
    return this.isListening;
  }

  updateMicUI(active) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('btn-voice-chat');
    if (btn) {
      btn.classList.toggle('listening', active);
      btn.textContent = active ? '🔴 Listening...' : '🎙 Voice Chat';
    }
  }

  handleUserVoiceInput(transcript) {
    const safeText = escapeHTML(transcript);
    const input = document.getElementById('dialogue-input');
    if (input) input.value = safeText;

    if (this.app && typeof this.app.sendDialogueMessage === 'function') {
      this.app.sendDialogueMessage(safeText);
    }
  }

  /**
   * Connect to Gemini Live API WebSocket endpoint
   */
  connectGeminiLive(apiKey = '', wsUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent') {
    if (typeof WebSocket === 'undefined') return;

    try {
      this.wsConnection = new WebSocket(`${wsUrl}?key=${encodeURIComponent(apiKey)}`);
      this.wsConnection.onopen = () => {
        console.log('[Skillverse] Gemini Live API WebSocket connected successfully.');
      };
      this.wsConnection.onmessage = (evt) => {
        console.log('[Skillverse] Received Live API packet:', evt.data);
      };
    } catch (err) {
      console.warn('[Skillverse] Gemini Live API connection failed:', err);
    }
  }
}
