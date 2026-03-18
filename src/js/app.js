import { elements } from './modules/elements.js';
import { loadSettings, stateEvents } from './modules/state.js';
import { setMode, toggleTimer, skipPhase, timerEvents } from './modules/timer.js';
import { loadTasks, addTask, toggleTaskComplete, setActiveTask, deleteTask, updateTaskPomodoros, taskEvents } from './modules/tasks.js';
import { toggleSettingsModal, saveSettings, applyTheme } from './modules/settings.js';
import { updateVolume } from './modules/audio.js';
import { initAuth, toggleAuthModal, getCurrentUser } from './modules/auth.js';
import { syncDataToCloud } from './modules/sync.js';
import { updateStatsUI } from './modules/stats.js';
import { initPiP, togglePiP, updatePipTask } from './modules/pip.js';
import { isUserTyping, debounce } from './modules/utils.js';

// Setup Event Bridges
timerEvents.onPomodoroComplete = () => {
    updateTaskPomodoros();
    updateStatsUI();
};

taskEvents.onTaskActivated = () => {
    setMode('pomodoro');
    updatePipTask();
};

// ... Timer Event Listeners ...
elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!e.target.classList.contains('active')) {
            setMode(btn.dataset.mode);
        }
    });
});

elements.mainBtn.addEventListener('click', toggleTimer);
elements.skipBtn.addEventListener('click', skipPhase);

// ... Tasks Event Listeners ...
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.taskInput.value.trim();
    const est = elements.estPomodorosInput.value;
    if (title) {
        addTask(title, est);
        elements.taskInput.value = '';
        elements.estPomodorosInput.value = '1';
        elements.taskInput.focus();
        updatePipTask();
    }
});

elements.taskList.addEventListener('click', (e) => {
    const checkBtn = e.target.closest('[data-action="toggle"]');
    if (checkBtn) {
        toggleTaskComplete(checkBtn.dataset.id);
        updatePipTask();
        return;
    }

    const contentBtn = e.target.closest('[data-action="activate"]');
    if (contentBtn) {
        setActiveTask(contentBtn.dataset.id);
        updatePipTask();
        return;
    }

    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
        deleteTask(deleteBtn.dataset.id);
        updatePipTask();
        return;
    }
});

// ... Settings Event Listeners ...
elements.settingsBtn.addEventListener('click', () => toggleSettingsModal(true));
elements.closeSettingsBtn.addEventListener('click', () => toggleSettingsModal(false));
elements.saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    toggleSettingsModal(false);
});

elements.inputs.volume.addEventListener('input', (e) => {
    elements.volumeDisplay.textContent = e.target.value;
});


// ... PiP Listener ...
elements.pipBtn.addEventListener('click', togglePiP);

// Global modal esc/click-outside handler
document.addEventListener('keydown', (e) => {
    // Check if user is typing in an input or textarea
    const typing = isUserTyping(e);

    if (e.key === 'Escape') {
        if (!elements.settingsModal.classList.contains('hidden')) toggleSettingsModal(false);
        if (!elements.authModal.classList.contains('hidden')) toggleAuthModal(false);
    }

    // Keyboard Shortcuts (only if not typing)
    if (!typing) {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            toggleTimer();
        }
        if (e.key.toLowerCase() === 's') {
            skipPhase();
        }
        if (e.key.toLowerCase() === 't') {
            e.preventDefault();
            elements.taskInput.focus();
        }
        if (e.key.toLowerCase() === 'p') {
            togglePiP();
        }
    }
});
elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) toggleSettingsModal(false);
});
elements.authModal.addEventListener('click', (e) => {
    if (e.target === elements.authModal) toggleAuthModal(false);
});


// --- Initialization ---
function init() {
    loadSettings();
    applyTheme();
    updateVolume();
    loadTasks();
    updateStatsUI();
    setMode('pomodoro');
    initPiP();

    // Centralized Syncing
    const debouncedSync = debounce(() => {
        const user = getCurrentUser();
        if (user) syncDataToCloud(user);
    }, 2000);

    stateEvents.onStateChange = debouncedSync;

    // Initialize Firebase Auth
    initAuth();
}

// Start
init();
