import { state } from './state';
import { elements } from './elements';

let audioCtx: AudioContext | null = null;
let fallbackInterval: ReturnType<typeof setInterval> | null = null;
let noiseSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

function playFallbackAlarm(type: 'bell' | 'bird' | 'digital', volumeOverride?: number): void {
    const rawVol = volumeOverride ?? state.settings.volume;
    if (rawVol <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const vol = Math.max(0.01, (rawVol / 100) * 0.35);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
    } else if (type === 'bird') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.3);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(vol * 0.5, now);
        gain.gain.setValueAtTime(0.001, now + 0.15);
        gain.gain.setValueAtTime(vol * 0.5, now + 0.25);
        gain.gain.setValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
    }
}

function stopFallbackAmbient(): void {
    if (fallbackInterval !== null) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
    }
    if (noiseSource) {
        try { noiseSource.stop(); } catch (_) {}
        noiseSource.disconnect();
        noiseSource = null;
    }
}

function startFallbackAmbient(type: 'tick' | 'rain'): void {
    stopFallbackAmbient();
    const ctx = getAudioContext();
    if (!ctx) return;
    const vol = Math.max(0.005, (state.settings.volume / 100) * 0.15);

    if (type === 'tick') {
        fallbackInterval = setInterval(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.04);
        }, 1000);
    } else {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gain = ctx.createGain();
        gain.gain.value = vol;

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        noiseSource = src;
    }
}

export function previewAlarm(alarmSound: 'bell' | 'bird' | 'digital', volume: number): void {
    const sound = elements.sounds[alarmSound] as HTMLAudioElement;
    const clampedVol = Math.min(1, Math.max(0, volume / 100));
    if (sound) {
        sound.volume = clampedVol;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            playFallbackAlarm(alarmSound, volume);
            return;
        }
        if (!sound.src && sound.dataset.src) {
            sound.src = sound.dataset.src;
            sound.load();
        }
        sound.currentTime = 0;
        sound.play().catch(() => playFallbackAlarm(alarmSound, volume));
    } else {
        playFallbackAlarm(alarmSound, volume);
    }
}

export function playAlarm(): void {
    const alarmSound = state.settings.alarmSound;
    const sound = elements.sounds[alarmSound] as HTMLAudioElement;
    if (sound) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            playFallbackAlarm(alarmSound);
            return;
        }
        if (!sound.src && sound.dataset.src) {
            sound.src = sound.dataset.src;
            sound.load();
        }
        sound.currentTime = 0;
        sound.play().catch(() => playFallbackAlarm(alarmSound));
    } else {
        playFallbackAlarm(alarmSound);
    }
}

export function toggleBackgroundSound(play: boolean): void {
    if (elements.sounds.tick) elements.sounds.tick.pause();
    if (elements.sounds.rain) elements.sounds.rain.pause();
    stopFallbackAmbient();

    if (play && state.settings.tickingSound !== 'none') {
        const tickingSound = state.settings.tickingSound;
        if (tickingSound === 'tick' || tickingSound === 'rain') {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                startFallbackAmbient(tickingSound);
                return;
            }
            const sound = elements.sounds[tickingSound] as HTMLAudioElement;
            if (sound) {
                if (!sound.src && sound.dataset.src) {
                    sound.src = sound.dataset.src;
                    sound.load();
                }
                sound.loop = true;
                sound.play().catch(() => startFallbackAmbient(tickingSound));
            } else {
                startFallbackAmbient(tickingSound);
            }
        }
    }
}

export function updateVolume(): void {
    const vol = state.settings.volume / 100;
    Object.values(elements.sounds).forEach(audio => {
        if (audio) audio.volume = vol;
    });
}
