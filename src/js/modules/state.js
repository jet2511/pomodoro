export const state = {
    mode: 'pomodoro',
    timeRemaining: 25 * 60,
    isRunning: false,
    timerId: null,
    pomodorosCompleted: 0,
    tasks: [],
    activeTaskId: null,
    settings: {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        alarmSound: 'bell',
        tickingSound: 'none',
        volume: 50,
        darkMode: true
    },
    focusHistory: {} // Format: { "YYYY-MM-DD": { seconds: 0, pomodoros: 0 } }
};

// Event listener for state changes (e.g., for syncing)
export const stateEvents = {
    onStateChange: () => { }
};

/**
 * Notifies that the state has changed and triggers a sync if needed
 */
export function notifyStateChange() {
    stateEvents.onStateChange(state);
}

export function loadSettings() {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.settings) {
                state.settings = { ...state.settings, ...data.settings };
            } else if (data.pomodoro) { // legacy format check
                state.settings = { ...state.settings, ...data };
            }
            state.focusHistory = data.focusHistory || {};
        } catch (e) {
            console.error("Failed to parse pomodoro_settings from localStorage", e);
        }
    }
}

export function saveSettings() {
    // Limit focusHistory to last 365 days
    const historyKeys = Object.keys(state.focusHistory).sort((a, b) => new Date(b) - new Date(a));
    if (historyKeys.length > 365) {
        const newHistory = {};
        for (let i = 0; i < 365; i++) {
            newHistory[historyKeys[i]] = state.focusHistory[historyKeys[i]];
        }
        state.focusHistory = newHistory;
    }

    localStorage.setItem('pomodoro_settings', JSON.stringify({
        settings: state.settings,
        focusHistory: state.focusHistory
    }));
}
