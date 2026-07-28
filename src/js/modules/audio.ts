import { state } from './state';
import { elements } from './elements';

export function playAlarm(): void {
    const alarmSound = state.settings.alarmSound;
    const sound = elements.sounds[alarmSound] as HTMLAudioElement;
    if (sound) {
        if (!sound.src && sound.dataset.src) {
            sound.src = sound.dataset.src;
            sound.load();
        }
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio blocked', e));
    }
}

export function toggleBackgroundSound(play: boolean): void {
    if (elements.sounds.tick) elements.sounds.tick.pause();
    if (elements.sounds.rain) elements.sounds.rain.pause();
    
    if (play && state.settings.tickingSound !== 'none') {
        const tickingSound = state.settings.tickingSound;
        // Since tickingSound can be 'none' | 'tick' | 'rain', and elements.sounds has keys bell, bird, digital, tick, rain.
        if (tickingSound === 'tick' || tickingSound === 'rain') {
            const sound = elements.sounds[tickingSound] as HTMLAudioElement;
            if (sound) {
                if (!sound.src && sound.dataset.src) {
                    sound.src = sound.dataset.src;
                    sound.load();
                }
                sound.loop = true;
                sound.play().catch(e => console.log('Audio blocked', e));
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
