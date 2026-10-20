/**
 * SIBEL - Audio Engine
 * Handles Web Audio API synthesized school bells, custom audio playback, and Text-to-Speech.
 */

import { PresetTone } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isAudioUnlocked = false;
  private isPlaying = false;
  private activeOscillators: OscillatorNode[] = [];
  private onPlaybackStateChange?: (isPlaying: boolean, currentTrack?: string) => void;

  constructor() {
    // AudioContext will be initialized upon user gesture
  }

  public setPlaybackListener(callback: (isPlaying: boolean, currentTrack?: string) => void) {
    this.onPlaybackStateChange = callback;
  }

  private notifyState(playing: boolean, trackName?: string) {
    this.isPlaying = playing;
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(playing, trackName);
    }
  }

  public getIsUnlocked(): boolean {
    return this.isAudioUnlocked;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Initializes or resumes the AudioContext after user interaction
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Play a short silent buffer to fully unlock iOS/WebKit restrictions
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);

      this.isAudioUnlocked = true;
      return true;
    } catch (err) {
      console.warn('Gagal membuka audio context otomatis:', err);
      return false;
    }
  }

  public setMasterVolume(volumePercent: number) {
    const vol = Math.max(0, Math.min(100, volumePercent)) / 100;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = vol;
    }
  }

  /**
   * Generates a realistic bell chime strike with physical overtones and decay
   */
  private createChimeStrike(freq: number, startTime: number, duration: number, gainMultiplier = 1.0) {
    if (!this.ctx || !this.masterGain) return;

    // Bell overtones ratios: fundamental (1x), minor third (1.2x), fifth (1.5x), octave (2.0x), superoctave (2.7x)
    const overtones = [
      { ratio: 1.0, gain: 0.6 * gainMultiplier, decay: duration },
      { ratio: 1.5, gain: 0.3 * gainMultiplier, decay: duration * 0.8 },
      { ratio: 2.0, gain: 0.25 * gainMultiplier, decay: duration * 0.6 },
      { ratio: 2.76, gain: 0.15 * gainMultiplier, decay: duration * 0.4 },
      { ratio: 4.07, gain: 0.08 * gainMultiplier, decay: duration * 0.25 },
    ];

    overtones.forEach(ot => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ot.ratio, startTime);

      // Strike envelope: instant attack, exponential decay
      strikeGain.gain.setValueAtTime(0.0001, startTime);
      strikeGain.gain.linearRampToValueAtTime(ot.gain, startTime + 0.015);
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, startTime + ot.decay);

      osc.connect(strikeGain);
      strikeGain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + ot.decay + 0.1);

      this.activeOscillators.push(osc);
      osc.onended = () => {
        this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
      };
    });
  }

  /**
   * Synthesize classic Westminster Chime (Bel Sekolah 4 Nada / 8 Nada)
   */
  public async playWestminster(isFull = true): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx) return;

    this.stopAll();
    this.notifyState(true, 'Bel Westminster');

    // Notes: G#4 (415.3), F#4 (369.99), E4 (329.63), B3 (246.94)
    const notes = isFull
      ? [
          { f: 415.3, d: 1.2 }, // G#4
          { f: 369.99, d: 1.2 }, // F#4
          { f: 329.63, d: 1.4 }, // E4
          { f: 246.94, d: 2.0 }, // B3
          { f: 329.63, d: 1.2 }, // E4
          { f: 369.99, d: 1.2 }, // F#4
          { f: 415.3, d: 1.4 }, // G#4
          { f: 329.63, d: 2.8 }, // E4 (panjang akhir)
        ]
      : [
          { f: 415.3, d: 1.1 }, // G#4
          { f: 369.99, d: 1.1 }, // F#4
          { f: 329.63, d: 1.3 }, // E4
          { f: 246.94, d: 2.2 }, // B3
        ];

    let t = this.ctx.currentTime + 0.05;
    const noteSpacing = 0.95;

    notes.forEach((n, idx) => {
      this.createChimeStrike(n.f, t, n.d);
      t += noteSpacing;
      // Add pause between 4-note phrases
      if (idx === 3 && isFull) {
        t += 0.5;
      }
    });

    const totalDuration = (t - this.ctx.currentTime + 1.5) * 1000;
    setTimeout(() => {
      this.notifyState(false);
    }, totalDuration);
  }

  /**
   * Synthesize Ding Dong 2-tone chime (Pergantian Jam)
   */
  public async playDingDong(): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx) return;

    this.stopAll();
    this.notifyState(true, 'Bel Ding-Dong');

    const t = this.ctx.currentTime + 0.05;
    // Sol (G5: 783.99Hz) -> Do (C5: 523.25Hz)
    this.createChimeStrike(783.99, t, 1.8, 1.0);
    this.createChimeStrike(523.25, t + 0.85, 2.8, 1.1);

    setTimeout(() => {
      this.notifyState(false);
    }, 4000);
  }

  /**
   * Synthesize Tri-Chime (3 Nada Naik - Istirahat / Masuk)
   */
  public async playTriChime(): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx) return;

    this.stopAll();
    this.notifyState(true, 'Bel Tri-Chime');

    const t = this.ctx.currentTime + 0.05;
    // E5 (659.25Hz) -> G#5 (830.61Hz) -> B5 (987.77Hz)
    this.createChimeStrike(659.25, t, 1.5, 0.9);
    this.createChimeStrike(830.61, t + 0.65, 1.6, 0.95);
    this.createChimeStrike(987.77, t + 1.3, 2.8, 1.1);

    setTimeout(() => {
      this.notifyState(false);
    }, 4500);
  }

  /**
   * Synthesize Fanfare / Upacara Apel Pagi
   */
  public async playFanfare(): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx) return;

    this.stopAll();
    this.notifyState(true, 'Fanfare Apel Pagi');

    // Brass fanfare arpeggio: C4, E4, G4, C5, G4, C5
    const notes = [
      { f: 261.63, d: 0.4, gap: 0.35 },
      { f: 329.63, d: 0.4, gap: 0.35 },
      { f: 392.0, d: 0.4, gap: 0.35 },
      { f: 523.25, d: 0.6, gap: 0.5 },
      { f: 392.0, d: 0.4, gap: 0.35 },
      { f: 523.25, d: 2.5, gap: 2.0 },
    ];

    let t = this.ctx.currentTime + 0.05;
    notes.forEach(n => {
      this.createChimeStrike(n.f, t, n.d, 1.0);
      t += n.gap;
    });

    setTimeout(() => {
      this.notifyState(false);
    }, (t - this.ctx.currentTime + 1.0) * 1000);
  }

  /**
   * Synthesize Sholawat / Melodi Islami Dhuha SMK As-Syafi'iyah
   */
  public async playSholawatChime(): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx) return;

    this.stopAll();
    this.notifyState(true, 'Nada Pagi Islami As-Syafi’iyah');

    // Pentatonic peaceful chime sequence (D4, F#4, A4, B4, D5, A4, F#4, D4)
    const melody = [
      { f: 293.66, d: 1.2 }, // D4
      { f: 369.99, d: 1.2 }, // F#4
      { f: 440.0, d: 1.4 },  // A4
      { f: 493.88, d: 1.5 }, // B4
      { f: 587.33, d: 2.2 }, // D5
      { f: 440.0, d: 1.4 },  // A4
      { f: 369.99, d: 1.5 }, // F#4
      { f: 293.66, d: 3.0 }, // D4
    ];

    let t = this.ctx.currentTime + 0.05;
    melody.forEach(m => {
      this.createChimeStrike(m.f, t, m.d, 0.85);
      t += 0.8;
    });

    setTimeout(() => {
      this.notifyState(false);
    }, (t - this.ctx.currentTime + 1.5) * 1000);
  }

  /**
   * Synthesize Classic Electronic Buzzer
   */
  public async playBuzzer(): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx || !this.masterGain) return;

    this.stopAll();
    this.notifyState(true, 'Bel Buzzer Listrik');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime); // Low electric hum

    // 3 sharp bursts: beep - beep - beeeep
    const t = this.ctx.currentTime + 0.05;
    gain.gain.setValueAtTime(0, t);

    // Burst 1
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.setValueAtTime(0, t + 0.4);

    // Burst 2
    gain.gain.setValueAtTime(0.7, t + 0.6);
    gain.gain.setValueAtTime(0, t + 1.0);

    // Burst 3
    gain.gain.setValueAtTime(0.8, t + 1.2);
    gain.gain.setValueAtTime(0, t + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.3);

    this.activeOscillators.push(osc);
    setTimeout(() => {
      this.notifyState(false);
    }, 2800);
  }

  /**
   * Synthesize Emergency Siren (Kebakaran / Gempa Evakuasi)
   */
  public async playSiren(): Promise<void> {
    await this.unlockAudio();
    if (!this.ctx || !this.masterGain) return;

    this.stopAll();
    this.notifyState(true, 'Sirene Darurat / Evakuasi');

    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    // LFO sweeps frequency between 400Hz and 900Hz every 1.5s
    lfo.frequency.setValueAtTime(0.7, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime + 6.0);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 6.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start();
    osc.start();

    osc.stop(this.ctx.currentTime + 6.5);
    lfo.stop(this.ctx.currentTime + 6.5);

    this.activeOscillators.push(osc, lfo);

    setTimeout(() => {
      this.notifyState(false);
    }, 7000);
  }

  /**
   * Play preset chime tone by identifier
   */
  public async playPreset(tone: PresetTone): Promise<void> {
    switch (tone) {
      case 'westminster':
        return this.playWestminster(true);
      case 'ding_dong':
        return this.playDingDong();
      case 'tri_chime':
        return this.playTriChime();
      case 'fanfare':
        return this.playFanfare();
      case 'sholawat_chime':
        return this.playSholawatChime();
      case 'buzzer':
        return this.playBuzzer();
      case 'siren':
        return this.playSiren();
      default:
        return this.playDingDong();
    }
  }

  /**
   * Play custom audio file from Blob or URL
   */
  public async playAudioBlob(blob: Blob, name = 'Audio Kustom', repeatCount = 1): Promise<void> {
    await this.unlockAudio();
    this.stopAll();

    const audioUrl = URL.createObjectURL(blob);
    this.currentAudioElement = new Audio(audioUrl);
    if (this.masterGain && this.ctx) {
      this.currentAudioElement.volume = this.masterGain.gain.value;
    }

    this.notifyState(true, name);

    let currentIteration = 1;

    return new Promise((resolve) => {
      if (!this.currentAudioElement) {
        this.notifyState(false);
        resolve();
        return;
      }

      this.currentAudioElement.onended = () => {
        if (currentIteration < repeatCount && this.isPlaying) {
          currentIteration++;
          if (this.currentAudioElement) {
            this.currentAudioElement.currentTime = 0;
            this.currentAudioElement.play().catch(() => {
              this.notifyState(false);
              resolve();
            });
          }
        } else {
          URL.revokeObjectURL(audioUrl);
          this.currentAudioElement = null;
          this.notifyState(false);
          resolve();
        }
      };

      this.currentAudioElement.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudioElement = null;
        this.notifyState(false);
        resolve();
      };

      this.currentAudioElement.play().catch(err => {
        console.error('Gagal memutar audio kustom:', err);
        URL.revokeObjectURL(audioUrl);
        this.currentAudioElement = null;
        this.notifyState(false);
        resolve();
      });
    });
  }

  /**
   * Text-to-Speech in Indonesian
   */
  public async speakText(text: string, rate = 0.95, pitch = 1.0): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.warn('Browser tidak mendukung SpeechSynthesis');
      return;
    }

    window.speechSynthesis.cancel();
    this.notifyState(true, 'Pengumuman Suara (TTS)');

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = 'id-ID';

      // Try finding Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onend = () => {
        this.notifyState(false);
        resolve();
      };

      utterance.onerror = () => {
        this.notifyState(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Plays a bell chime sequence: prelude chime -> then optional speech -> repeated if specified
   */
  public async playBellSequence(options: {
    name: string;
    presetTone?: PresetTone;
    customAudioBlob?: Blob;
    ttsText?: string;
    repeatCount?: number;
  }): Promise<void> {
    const { presetTone = 'westminster', customAudioBlob, ttsText, repeatCount = 1 } = options;

    for (let i = 0; i < repeatCount; i++) {
      if (!this.isPlaying && i > 0) break; // Interrupted

      if (customAudioBlob) {
        await this.playAudioBlob(customAudioBlob, options.name, 1);
      } else {
        await this.playPreset(presetTone);
      }

      // If there is TTS text, announce it after a short breather
      if (ttsText && ttsText.trim()) {
        await new Promise(r => setTimeout(r, 600));
        await this.speakText(ttsText.trim());
      }

      if (i < repeatCount - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  /**
   * Emergency stop all sounds, audio elements, and speech synthesis
   */
  public stopAll() {
    // 1. Stop active Web Audio oscillators
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.activeOscillators = [];

    // 2. Stop HTML Audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // Ignored
      }
      this.currentAudioElement = null;
    }

    // 3. Stop SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }

    this.notifyState(false);
  }
}

export const audioEngine = new AudioEngine();
