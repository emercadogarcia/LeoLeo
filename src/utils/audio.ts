import { AudioSettings } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global speech synthesis tracking
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const defaultAudioSettings: AudioSettings = {
  volume: 0.9,
  rate: 0.85, // Slightly slower cadence for early readers
  pitch: 1.15, // Friendly, warm, slightly higher child-friendly pitch
  sfxVolume: 0.85,
  speechEnabled: true,
  sfxEnabled: true,
};

let cachedSettings = { ...defaultAudioSettings };

export function updateAudioSettings(newSettings: Partial<AudioSettings>) {
  cachedSettings = { ...cachedSettings, ...newSettings };
}

export function getAudioSettings(): AudioSettings {
  return { ...cachedSettings };
}

// Find the best neutral Spanish voice
function findSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prioritize Latin American / Neutral Spanish, then Mexican, then any Spanish
  const preferred = voices.find(v => v.lang.toLowerCase().includes('es-419') || v.lang.toLowerCase().includes('es-mx'));
  if (preferred) return preferred;

  const anyEs = voices.find(v => v.lang.toLowerCase().startsWith('es'));
  if (anyEs) return anyEs;

  return null;
}

// Pre-warm voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    findSpanishVoice();
  };
}

export function cancelSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!cachedSettings.speechEnabled) return;

  try {
    cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findSpanishVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'es-MX';
    }

    utterance.volume = cachedSettings.volume;
    utterance.rate = options?.rate ?? cachedSettings.rate;
    utterance.pitch = options?.pitch ?? cachedSettings.pitch;

    utterance.onend = () => {
      currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      currentUtterance = null;
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

// Sound effects using Web Audio API
export function playPopSound() {
  if (!cachedSettings.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

  gain.gain.setValueAtTime(cachedSettings.sfxVolume * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

export function playSuccessChime() {
  if (!cachedSettings.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5, E5, G5, C6 arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteStart = now + idx * 0.08;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(cachedSettings.sfxVolume * 0.35, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.35);
  });
}

export function playGentleBoing() {
  if (!cachedSettings.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  // Soft pitch wobble down, friendly, non-punishing
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.linearRampToValueAtTime(200, now + 0.15);
  osc.frequency.linearRampToValueAtTime(160, now + 0.3);

  gain.gain.setValueAtTime(cachedSettings.sfxVolume * 0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.32);
}

export function playStarCollect() {
  if (!cachedSettings.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

  gain.gain.setValueAtTime(cachedSettings.sfxVolume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

export function playTrainWhistle() {
  if (!cachedSettings.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Train whistle has two close harmonious tones
  [587.33, 739.99].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq + 15, now + 0.2);
    osc.frequency.linearRampToValueAtTime(freq, now + 0.45);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(cachedSettings.sfxVolume * 0.2, now + 0.05);
    gain.gain.linearRampToValueAtTime(cachedSettings.sfxVolume * 0.2, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  });
}

export function playTileSnap() {
  if (!cachedSettings.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);

  gain.gain.setValueAtTime(cachedSettings.sfxVolume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}
