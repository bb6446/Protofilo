/**
 * Web Audio API Procedural Sound Synthesizer
 * Zero external asset dependencies - generates all sounds mathematically!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // start muted for safe autoplay policy
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
      this.playChime();
    }
    return this.isMuted;
  }

  // Futuristic UI button click
  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Interactive Hover blip
  playHover() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // 3D Geometry change or action chime
  playChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.4);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Ambient Deep-Space Synth Pad
  startAmbient() {
    if (this.isMuted || !this.ctx || this.isAmbientPlaying) return;
    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 3);

      // Low sub bass
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

      // Ethereal fifth
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      // Filter for warm space hum
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient start failed', e);
    }
  }

  stopAmbient() {
    if (!this.isAmbientPlaying || !this.ctx) return;
    try {
      if (this.ambientGain) {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1);
        setTimeout(() => {
          if (this.ambientOsc1) this.ambientOsc1.stop();
          if (this.ambientOsc2) this.ambientOsc2.stop();
          this.isAmbientPlaying = false;
        }, 1000);
      }
    } catch (e) {
      this.isAmbientPlaying = false;
    }
  }

  // Hyperspace Warp Jump Boom
  playWarpJump() {
    if (this.isMuted || !this.ctx) return;
    try {
      // Warp Charge (pitch riser)
      const chargeOsc = this.ctx.createOscillator();
      const chargeGain = this.ctx.createGain();
      chargeOsc.type = 'sawtooth';
      chargeOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
      chargeOsc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.2);
      
      chargeGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      chargeGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 1.2);
      chargeGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.3);

      chargeOsc.connect(chargeGain);
      chargeGain.connect(this.ctx.destination);
      chargeOsc.start();
      chargeOsc.stop(this.ctx.currentTime + 1.3);

      // Sonic Boom Shockwave (at 1.2s)
      setTimeout(() => {
        if (!this.ctx) return;
        const boomOsc = this.ctx.createOscillator();
        const boomGain = this.ctx.createGain();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
        boomOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.8);

        boomGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        boomGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        boomOsc.connect(boomGain);
        boomGain.connect(this.ctx.destination);
        boomOsc.start();
        boomOsc.stop(this.ctx.currentTime + 0.8);
      }, 1200);
    } catch (e) {
      console.warn('Warp audio failed', e);
    }
  }
}

export const sound = new SoundEngine();
