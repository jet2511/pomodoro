import { state, saveSettings as saveStateSettings, notifyStateChange } from './state';
import { elements } from './elements';
import { setMode } from './timer';
import { updateVolume } from './audio';

export function applySettingsToUI(): void {
    elements.inputs.pomodoro.value = String(state.settings.pomodoro);
    elements.inputs.shortBreak.value = String(state.settings.shortBreak);
    elements.inputs.longBreak.value = String(state.settings.longBreak);
    elements.inputs.longBreakInterval.value = String(state.settings.longBreakInterval);
    elements.inputs.autoStartBreaks.checked = state.settings.autoStartBreaks;
    elements.inputs.autoStartPomodoros.checked = state.settings.autoStartPomodoros;
    elements.inputs.alarmSound.value = state.settings.alarmSound;
    elements.inputs.tickingSound.value = state.settings.tickingSound;
    elements.inputs.volume.value = String(state.settings.volume);
    elements.volumeDisplay.textContent = String(state.settings.volume);
    elements.inputs.darkMode.checked = state.settings.darkMode;
}

export function applyTheme(): void {
    if (state.settings.darkMode) {
        elements.html.removeAttribute('data-theme');
    } else {
        elements.html.setAttribute('data-theme', 'light');
    }
}

export function saveSettings(): void {
    state.settings.pomodoro = Math.min(90, Math.max(1, parseInt(elements.inputs.pomodoro.value) || 25));
    state.settings.shortBreak = Math.min(30, Math.max(1, parseInt(elements.inputs.shortBreak.value) || 5));
    state.settings.longBreak = Math.min(60, Math.max(1, parseInt(elements.inputs.longBreak.value) || 15));
    state.settings.longBreakInterval = Math.min(10, Math.max(1, parseInt(elements.inputs.longBreakInterval.value) || 4));
    
    state.settings.autoStartBreaks = elements.inputs.autoStartBreaks.checked;
    state.settings.autoStartPomodoros = elements.inputs.autoStartPomodoros.checked;
    state.settings.alarmSound = elements.inputs.alarmSound.value as 'bell' | 'bird' | 'digital';
    state.settings.tickingSound = elements.inputs.tickingSound.value as 'none' | 'tick' | 'rain';
    state.settings.volume = parseInt(elements.inputs.volume.value);
    state.settings.darkMode = elements.inputs.darkMode.checked;

    saveStateSettings();
    applyTheme();
    updateVolume();
    
    if (!state.isRunning) {
        setMode(state.mode);
    }
    notifyStateChange();
}

export function toggleSettingsModal(show: boolean): void {
    if (show) {
        applySettingsToUI();
        elements.settingsModal.classList.remove('hidden');
    } else {
        elements.settingsModal.classList.add('hidden');
    }
}
