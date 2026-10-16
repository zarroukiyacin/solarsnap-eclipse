// Web Audio API Synthesizer for Camera Shutter & Eclipse Alerts
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a realistic mechanical camera shutter click sound
 */
export function playShutterSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First click: shutter curtain opening
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.04);

    // Second click: shutter closing (0.06s later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(600, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain2.gain.setValueAtTime(0.4, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.05);
    osc2.stop(now + 0.09);
  } catch (e) {
    console.warn('Audio shutter error:', e);
  }
}

/**
 * Play a subtle beep for intervalometer countdown or focus lock
 */
export function playBeepSound(frequency = 880, duration = 0.08) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Beep error:', e);
  }
}

/**
 * Play safety audio alert beep for Totality C2 or C3 filter warning
 */
export function playSafetyAlertSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    [0, 0.15, 0.3].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx === 2 ? 1200 : 900, now + offset);

      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  } catch (e) {
    console.warn('Safety alert audio error:', e);
  }
}
