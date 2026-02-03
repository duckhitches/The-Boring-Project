/**
 * AudioWorklet processor for microphone input. Replaces deprecated ScriptProcessorNode.
 * Converts float32 samples to 16kHz mono PCM int16 and posts chunks to the main thread.
 */
const BUFFER_SIZE = 4096;

class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(BUFFER_SIZE);
    this.index = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    for (let i = 0; i < channel.length; i++) {
      const s = Math.max(-1, Math.min(1, channel[i]));
      this.buffer[this.index++] = s * 32768;
      if (this.index >= BUFFER_SIZE) {
        this.port.postMessage({ type: 'pcm', buffer: this.buffer.buffer }, [this.buffer.buffer]);
        this.buffer = new Int16Array(BUFFER_SIZE);
        this.index = 0;
      }
    }
    return true;
  }
}

registerProcessor('mic-processor', MicProcessor);
