import { state, notifyStateChange } from './state.js';
import { elements } from './elements.js';
import { toggleBackgroundSound, playAlarm } from './audio.js';

export const timerEvents = {
    onPomodoroComplete: () => { }
};

// Progress Circle setup
const radius = elements.progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
elements.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
elements.progressCircle.style.strokeDashoffset = 0;

function setProgress(percent) {
    const offset = circumference - percent / 100 * circumference;
    elements.progressCircle.style.strokeDashoffset = offset;
}

// --- Favicon Helper ---
function updateFavicon(mode) {
    const color = mode === 'pomodoro' ? '#ba4949' : (mode === 'shortBreak' ? '#38858a' : '#397097');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="${color}" />
            <path d="M50 20V50L70 70" stroke="white" stroke-width="8" stroke-linecap="round" fill="none" />
        </svg>
    `.trim();

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function updateDisplay() {
    elements.timeDisplay.textContent = formatTime(state.timeRemaining);
    const totalTime = state.settings[state.mode] * 60;
    const mathPercent = Math.max(0, state.timeRemaining / totalTime);
    const percentage = mathPercent * 100;
    setProgress(100 - percentage);
    document.title = `${formatTime(state.timeRemaining)} - ${getModeName(state.mode)}`;
}

function getModeName(mode) {
    switch (mode) {
        case 'pomodoro': return 'Focus';
        case 'shortBreak': return 'Short Break';
        case 'longBreak': return 'Long Break';
        default: return 'Pomodoro';
    }
}

export function setMode(mode) {
    if (state.isRunning) {
        if (!confirm('Timer is running. Are you sure you want to switch modes?')) {
            elements.modeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === state.mode);
            });
            return;
        }
        stopTimer(false);
    }

    state.mode = mode;
    state.timeRemaining = state.settings[mode] * 60;

    elements.body.className = `mode-${mode}`;

    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    updateDisplay();
    updateStatusText();
    updateFavicon(mode);
}

function updateStatusText() {
    if (state.isRunning) {
        elements.statusText.textContent = state.mode === 'pomodoro' ? 'Focus time!' : 'Take a break';
    } else {
        elements.statusText.textContent = state.mode === 'pomodoro' ? 'Ready to focus?' : 'Ready to rest?';
    }
}

function startTimer() {
    state.isRunning = true;
    elements.mainBtn.textContent = 'Pause';
    updateStatusText();

    toggleBackgroundSound(true);

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    let expected = Date.now() + 1000;
    state.timerId = setInterval(() => {
        const now = Date.now();
        const drift = now - expected;
        
        // If drift is too large (e.g. tab was suspended), we might want to catch up
        // or just decrement based on actual time elapsed.
        // For simplicity, we'll just handle the single tick and adjust next expected.
        
        if (state.timeRemaining > 0) {
            state.timeRemaining--;
            updateDisplay();
            expected += 1000;
        } else {
            handleTimerComplete();
        }
    }, 1000);
}

function stopTimer(completed = false) {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
    state.isRunning = false;
    elements.mainBtn.textContent = 'Start';
    toggleBackgroundSound(false);

    if (!completed) {
        updateStatusText();
    }
}

export function toggleTimer() {
    if (state.isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

export function skipPhase() {
    stopTimer(true);
    handleTimerComplete();
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'favicon.ico' });
    }
}

function handleTimerComplete() {
    stopTimer(true);
    playAlarm();

    if (state.mode === 'pomodoro') {
        state.pomodorosCompleted++;

        // Record Analytics
        const today = new Date().toISOString().split('T')[0];
        if (!state.focusHistory[today]) {
            state.focusHistory[today] = { seconds: 0, pomodoros: 0 };
        }
        state.focusHistory[today].pomodoros++;
        state.focusHistory[today].seconds += state.settings.pomodoro * 60;

        notifyStateChange();

        // Notify tasks module via app.js
        timerEvents.onPomodoroComplete();

        if (state.pomodorosCompleted % state.settings.longBreakInterval === 0) {
            showNotification('Pomodoro Completed!', 'Time for a long break.');
            setMode('longBreak');
        } else {
            showNotification('Pomodoro Completed!', 'Time for a short break.');
            setMode('shortBreak');
        }

        if (state.settings.autoStartBreaks) {
            setTimeout(startTimer, 1000);
        }

    } else {
        showNotification('Break is over!', 'Time to focus.');
        setMode('pomodoro');

        if (state.settings.autoStartPomodoros) {
            setTimeout(startTimer, 1000);
        }
    }
}
