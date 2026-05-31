import { state } from './state.js';
import { elements } from './elements.js';

export function playAlarm() {
    const sound = elements.sounds[state.settings.alarmSound];
    if (sound) {
        if (!sound.src && sound.dataset.src) {
            sound.src = sound.dataset.src;
            sound.load();
        }
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio blocked', e));
    }
}

export function toggleBackgroundSound(play) {
    if (elements.sounds.tick) elements.sounds.tick.pause();
    if (elements.sounds.rain) elements.sounds.rain.pause();
    
    if (play && state.settings.tickingSound !== 'none') {
        const sound = elements.sounds[state.settings.tickingSound];
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

export function updateVolume() {
    const vol = state.settings.volume / 100;
    Object.values(elements.sounds).forEach(audio => {
        if(audio) audio.volume = vol;
    });
}
