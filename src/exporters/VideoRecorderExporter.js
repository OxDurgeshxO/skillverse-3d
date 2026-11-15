/**
 * VideoRecorderExporter: 4K Cinematic Photo Studio & WebM/MP4 Video Clip Exporter
 * Captures 60 FPS canvas streams directly via MediaRecorder API and generates snapshot captures.
 */
export class VideoRecorderExporter {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.recordingStartTime = 0;
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    return typeof MediaRecorder !== 'undefined' && typeof this.canvas?.captureStream === 'function';
  }

  startRecording({ fps = 60 } = {}) {
    if (!this.isSupported()) {
      throw new Error('MediaRecorder or canvas.captureStream not supported in this browser environment.');
    }

    if (this.isRecording) return;

    this.recordedChunks = [];
    const stream = this.canvas.captureStream(fps);

    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = 'video/webm';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 12000000 // 12 Mbps for crisp 60 FPS captures
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.saveRecordedFile(selectedMime);
    };

    this.mediaRecorder.start(100); // 100ms chunk slices
    this.isRecording = true;
    this.recordingStartTime = Date.now();
  }

  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  saveRecordedFile(mimeType) {
    if (this.recordedChunks.length === 0) return;

    const blob = new Blob(this.recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    a.download = `skillverse-cinematic-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  captureSnapshot(filename = `skillverse-capture-${Date.now()}.png`) {
    if (!this.canvas) return null;

    try {
      const dataUrl = this.canvas.toDataURL('image/png');
      if (typeof document === 'undefined') return dataUrl;

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 500);
      return dataUrl;
    } catch (err) {
      console.warn('Canvas snapshot capture failed:', err);
      return null;
    }
  }
}
