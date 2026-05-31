import { elements } from './modules/elements.js';
import { loadSettings, stateEvents } from './modules/state.js';
import { setMode, toggleTimer, skipPhase, timerEvents } from './modules/timer.js';
import { loadTasks, addTask, toggleTaskComplete, setActiveTask, deleteTask, updateTaskPomodoros, taskEvents, getFirstIncompleteTask } from './modules/tasks.js';
import { toggleSettingsModal, saveSettings, applyTheme } from './modules/settings.js';
import { updateVolume } from './modules/audio.js';
import { initAuth, toggleAuthModal, getCurrentUser } from './modules/auth.js';
import { syncDataToCloud } from './modules/sync.js';
import { updateStatsUI } from './modules/stats.js';
import { initPiP, togglePiP, updateActiveTaskDisplay } from './modules/pip.js';
import { isUserTyping, debounce, trapFocus, customConfirm } from './modules/utils.js';

// Setup Event Bridges
timerEvents.onPomodoroComplete = () => {
    updateTaskPomodoros();
    updateStatsUI();
};

timerEvents.onPomodoroStart = async () => {
    const task = getFirstIncompleteTask();
    
    if (task) {
        const wantsToSelect = await customConfirm(`Bạn chưa chọn công việc nào. Bạn có muốn bắt đầu làm "${task.title}" không?`);
        if (wantsToSelect) {
            setActiveTask(task.id);
        }
        return true; 
    } else {
        elements.form.classList.add('pulse-warning');
        setTimeout(() => elements.form.classList.remove('pulse-warning'), 1000);
        return true; 
    }
};

taskEvents.onTaskActivated = () => {
    setMode('pomodoro');
    updateActiveTaskDisplay();
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
        updateActiveTaskDisplay();
    }
});

elements.taskList.addEventListener('click', (e) => {
    const checkBtn = e.target.closest('[data-action="toggle"]');
    if (checkBtn) {
        toggleTaskComplete(checkBtn.dataset.id);
        updateActiveTaskDisplay();
        return;
    }

    const contentBtn = e.target.closest('[data-action="activate"]');
    if (contentBtn) {
        setActiveTask(contentBtn.dataset.id);
        updateActiveTaskDisplay();
        return;
    }

    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
        deleteTask(deleteBtn.dataset.id);
        updateActiveTaskDisplay();
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

    const isSettingsOpen = !elements.settingsModal.classList.contains('hidden');
    const isAuthOpen = !elements.authModal.classList.contains('hidden');

    if (isSettingsOpen) {
        trapFocus(e, elements.settingsModal);
    } else if (isAuthOpen) {
        trapFocus(e, elements.authModal);
    }

    if (e.key === 'Escape') {
        if (isSettingsOpen) toggleSettingsModal(false);
        if (isAuthOpen) toggleAuthModal(false);
    }

    // Keyboard Shortcuts (only if not typing and no modifier keys and no modal open)
    if (!typing && !e.ctrlKey && !e.altKey && !e.metaKey && !isSettingsOpen && !isAuthOpen) {
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
    if (window.lucide) window.lucide.createIcons();

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
