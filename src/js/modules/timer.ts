import { state, notifyStateChange } from './state';
import { elements } from './elements';
import { toggleBackgroundSound, playAlarm } from './audio';
import { customConfirm } from './utils';

let sessionStartTime: number | null = null;
let sessionAccumulatedMs: number = 0;
let targetEndTime: number | null = null;

export const timerEvents: {
    onPomodoroComplete: () => void;
    onPomodoroStart: (() => Promise<boolean> | boolean) | null;
} = {
    onPomodoroComplete: () => { },
    onPomodoroStart: null // returns true if start should proceed
};

// Progress Circle setup
const radius = elements.progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
elements.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
elements.progressCircle.style.strokeDashoffset = '0';

function setProgress(percent: number): void {
    const offset = circumference - percent / 100 * circumference;
    elements.progressCircle.style.strokeDashoffset = String(offset);
}

// --- Favicon Helper ---
function updateFavicon(mode: 'pomodoro' | 'shortBreak' | 'longBreak'): void {
    const color = mode === 'pomodoro' ? '#ba4949' : (mode === 'shortBreak' ? '#38858a' : '#397097');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="${color}" />
            <path d="M50 20V50L70 70" stroke="white" stroke-width="8" stroke-linecap="round" fill="none" />
        </svg>
    `.trim();

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function updateDisplay(): void {
    elements.timeDisplay.textContent = formatTime(state.timeRemaining);
    const totalTime = state.settings[state.mode] * 60;
    const mathPercent = Math.max(0, state.timeRemaining / totalTime);
    const percentage = mathPercent * 100;
    setProgress(100 - percentage);
    document.title = `${formatTime(state.timeRemaining)} - ${getModeName(state.mode)}`;
}

function getModeName(mode: 'pomodoro' | 'shortBreak' | 'longBreak'): string {
    switch (mode) {
        case 'pomodoro': return 'Focus';
        case 'shortBreak': return 'Short Break';
        case 'longBreak': return 'Long Break';
        default: return 'Pomodoro';
    }
}

export async function setMode(mode: 'pomodoro' | 'shortBreak' | 'longBreak'): Promise<void> {
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

function updateStatusText(): void {
    if (state.isRunning) {
        elements.statusText.textContent = state.mode === 'pomodoro' ? 'Focus time!' : 'Take a break';
    } else {
        elements.statusText.textContent = state.mode === 'pomodoro' ? 'Ready to focus?' : 'Ready to rest?';
    }
}

async function startTimer(): Promise<void> {
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
    const displayParent = elements.timeDisplay.parentElement;
    if (displayParent) displayParent.classList.add('is-running');
    
    const timerSec = elements.timeDisplay.closest('.timer-section');
    if (timerSec) timerSec.classList.add('running');
    
    updateStatusText();

    toggleBackgroundSound(true);

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    sessionStartTime = Date.now();
    targetEndTime = sessionStartTime + (state.timeRemaining * 1000);

    state.timerId = setInterval(() => {
        if (targetEndTime === null) return;
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        
        if (state.timeRemaining !== remaining) {
            state.timeRemaining = remaining;
            updateDisplay();
        }
        
        if (state.timeRemaining <= 0) {
            handleTimerComplete();
        }
    }, 200) as unknown as number; // Update frequently for accuracy
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

function stopTimer(completed: boolean = false): void {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
    
    if (sessionStartTime) {
        sessionAccumulatedMs += (Date.now() - sessionStartTime);
        sessionStartTime = null;
    }

    targetEndTime = null;
    state.isRunning = false;
    elements.mainBtn.textContent = 'Start';
    elements.mainBtn.setAttribute('aria-label', 'Start Timer');
    
    // Remove classes for animations
    const displayParent = elements.timeDisplay.parentElement;
    if (displayParent) displayParent.classList.remove('is-running');
    
    const timerSec = elements.timeDisplay.closest('.timer-section');
    if (timerSec) timerSec.classList.remove('running');
    
    toggleBackgroundSound(false);

    if (!completed) {
        updateStatusText();
    }
}

export async function toggleTimer(): Promise<void> {
    if (state.isRunning) {
        stopTimer();
    } else {
        await startTimer();
    }
}

export async function skipPhase(): Promise<void> {
    if (state.isRunning) {
        const wantsToSkip = await customConfirm("Are you sure you want to skip the current phase?");
        if (!wantsToSkip) return;
    }
    // handleTimerComplete already calls stopTimer(true)
    handleTimerComplete(true);
}

function showNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'favicon.ico' });
    }
}

function handleTimerComplete(isSkipped: boolean = false): void {
    stopTimer(true);
    if (!isSkipped) playAlarm();

    if (state.mode === 'pomodoro') {
        if (!isSkipped) {
            state.pomodorosCompleted++;

            // Record Analytics
            const today = new Date().toLocaleDateString('en-CA');
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
