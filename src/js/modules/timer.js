import { state, notifyStateChange } from './state.js';
import { elements } from './elements.js';
import { toggleBackgroundSound, playAlarm } from './audio.js';
import { customConfirm } from './utils.js';

let sessionStartTime = null;
let sessionAccumulatedMs = 0;
let targetEndTime = null;
export const timerEvents = {
    onPomodoroComplete: () => { },
    onPomodoroStart: null // returns true if start should proceed
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

export async function setMode(mode) {
    if (state.isRunning) {
        const wantsToSwitch = await customConfirm('Timer is running. Are you sure you want to switch modes?');
        if (!wantsToSwitch) {
            elements.modeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === state.mode);
            });
            return;
        }
        stopTimer(false);
    }

    sessionAccumulatedMs = 0;
    sessionStartTime = null;

    state.mode = mode;
    state.timeRemaining = state.settings[mode] * 60;

    elements.body.className = `mode-${mode}`;

    elements.modeBtns.forEach(btn => {
        const isActive = btn.dataset.mode === mode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive.toString());
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

async function startTimer() {
    if (state.mode === 'pomodoro' && !state.activeTaskId) {
        if (timerEvents.onPomodoroStart) {
            const shouldContinue = await timerEvents.onPomodoroStart();
            if (!shouldContinue) return; // Start aborted
        }
    }

    state.isRunning = true;
    elements.mainBtn.textContent = 'Pause';
    elements.mainBtn.setAttribute('aria-label', 'Pause Timer');
    
    // Add classes for animations
    elements.timeDisplay.parentElement.classList.add('is-running');
    elements.timeDisplay.closest('.timer-section').classList.add('running');
    
    updateStatusText();

    toggleBackgroundSound(true);

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    sessionStartTime = Date.now();
    targetEndTime = sessionStartTime + (state.timeRemaining * 1000);

    state.timerId = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        
        if (state.timeRemaining !== remaining) {
            state.timeRemaining = remaining;
            updateDisplay();
        }
        
        if (state.timeRemaining <= 0) {
            handleTimerComplete();
        }
    }, 200); // Update frequently for accuracy
}

// Ensure timer UI updates immediately when returning to the tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.isRunning && targetEndTime) {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        state.timeRemaining = remaining;
        updateDisplay();
        if (state.timeRemaining <= 0) {
            handleTimerComplete();
        }
    }
});

function stopTimer(completed = false) {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
    
    if (sessionStartTime) {
        sessionAccumulatedMs += (Date.now() - sessionStartTime);
        sessionStartTime = null;
    }

    state.isRunning = false;
    elements.mainBtn.textContent = 'Start';
    elements.mainBtn.setAttribute('aria-label', 'Start Timer');
    
    // Remove classes for animations
    elements.timeDisplay.parentElement.classList.remove('is-running');
    elements.timeDisplay.closest('.timer-section').classList.remove('running');
    
    toggleBackgroundSound(false);

    if (!completed) {
        updateStatusText();
    }
}

export async function toggleTimer() {
    if (state.isRunning) {
        stopTimer();
    } else {
        await startTimer();
    }
}

export async function skipPhase() {
    if (state.isRunning) {
        const wantsToSkip = await customConfirm("Are you sure you want to skip the current phase?");
        if (!wantsToSkip) return;
    }
    // handleTimerComplete already calls stopTimer(true)
    handleTimerComplete(true);
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'favicon.ico' });
    }
}

function handleTimerComplete(isSkipped = false) {
    stopTimer(true);
    if (!isSkipped) playAlarm();

    if (state.mode === 'pomodoro') {
        if (!isSkipped) {
            state.pomodorosCompleted++;

            // Record Analytics
            const today = new Date().toISOString().split('T')[0];
            if (!state.focusHistory[today]) {
                state.focusHistory[today] = { seconds: 0, pomodoros: 0 };
            }
            state.focusHistory[today].pomodoros++;
            
            const elapsedSeconds = Math.round(sessionAccumulatedMs / 1000);
            state.focusHistory[today].seconds += elapsedSeconds;
            sessionAccumulatedMs = 0;

            notifyStateChange();

            // Notify tasks module via app.js
            timerEvents.onPomodoroComplete();
        }

        if (state.pomodorosCompleted > 0 && state.pomodorosCompleted % state.settings.longBreakInterval === 0) {
            if (!isSkipped) showNotification('Pomodoro Completed!', 'Time for a long break.');
            setMode('longBreak');
        } else {
            if (!isSkipped) showNotification('Pomodoro Completed!', 'Time for a short break.');
            setMode('shortBreak');
        }

        if (state.settings.autoStartBreaks) {
            setTimeout(startTimer, 1000);
        }

    } else {
        if (!isSkipped) showNotification('Break is over!', 'Time to focus.');
        setMode('pomodoro');

        if (state.settings.autoStartPomodoros) {
            setTimeout(startTimer, 1000);
        }
    }
}
