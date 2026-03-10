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
    }
};

export function loadSettings() {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
        try {
            state.settings = { ...state.settings, ...JSON.parse(saved) };
        } catch(e) {}
    }
}

export function saveSettings() {
    localStorage.setItem('pomodoro_settings', JSON.stringify(state.settings));
}
