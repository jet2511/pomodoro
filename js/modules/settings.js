import { state, saveSettings as saveStateSettings } from './state.js';
import { elements } from './elements.js';
import { setMode } from './timer.js';
import { updateVolume } from './audio.js';

export function applySettingsToUI() {
    elements.inputs.pomodoro.value = state.settings.pomodoro;
    elements.inputs.shortBreak.value = state.settings.shortBreak;
    elements.inputs.longBreak.value = state.settings.longBreak;
    elements.inputs.longBreakInterval.value = state.settings.longBreakInterval;
    elements.inputs.autoStartBreaks.checked = state.settings.autoStartBreaks;
    elements.inputs.autoStartPomodoros.checked = state.settings.autoStartPomodoros;
    elements.inputs.alarmSound.value = state.settings.alarmSound;
    elements.inputs.tickingSound.value = state.settings.tickingSound;
    elements.inputs.volume.value = state.settings.volume;
    elements.volumeDisplay.textContent = state.settings.volume;
    elements.inputs.darkMode.checked = state.settings.darkMode;
}

export function applyTheme() {
    if (state.settings.darkMode) {
        elements.html.removeAttribute('data-theme');
    } else {
        elements.html.setAttribute('data-theme', 'light');
    }
}

export function updateVolumeDisplay(value) {
    elements.volumeDisplay.textContent = value;
}

export function saveSettings() {
    state.settings.pomodoro = parseInt(elements.inputs.pomodoro.value) || 25;
    state.settings.shortBreak = parseInt(elements.inputs.shortBreak.value) || 5;
    state.settings.longBreak = parseInt(elements.inputs.longBreak.value) || 15;
    state.settings.longBreakInterval = parseInt(elements.inputs.longBreakInterval.value) || 4;
    
    state.settings.autoStartBreaks = elements.inputs.autoStartBreaks.checked;
    state.settings.autoStartPomodoros = elements.inputs.autoStartPomodoros.checked;
    state.settings.alarmSound = elements.inputs.alarmSound.value;
    state.settings.tickingSound = elements.inputs.tickingSound.value;
    state.settings.volume = parseInt(elements.inputs.volume.value);
    state.settings.darkMode = elements.inputs.darkMode.checked;

    saveStateSettings();
    applyTheme();
    updateVolume();
    
    if (!state.isRunning) {
        setMode(state.mode);
    }
}

export function toggleSettingsModal(show) {
    if (show) {
        applySettingsToUI();
        elements.settingsModal.classList.remove('hidden');
    } else {
        elements.settingsModal.classList.add('hidden');
    }
}
