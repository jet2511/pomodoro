export const elements = {
    body: document.body,
    html: document.documentElement,
    timeDisplay: document.getElementById('time-display'),
    mainBtn: document.getElementById('main-btn'),
    skipBtn: document.getElementById('skip-btn'),
    statusText: document.getElementById('status-text'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    progressCircle: document.querySelector('.progress-ring__circle'),

    // Audio
    sounds: {
        bell: document.getElementById('bell-sound'),
        bird: document.getElementById('bird-sound'),
        digital: document.getElementById('digital-sound'),
        tick: document.getElementById('tick-sound'),
        rain: document.getElementById('rain-sound')
    },

    // Forms
    form: document.getElementById('add-task-form'),
    taskInput: document.getElementById('task-input'),
    estPomodorosInput: document.getElementById('est-pomodoros-input'),
    taskList: document.getElementById('task-list'),

    // Settings
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),

    // Setting Inputs
    inputs: {
        pomodoro: document.getElementById('setting-pomodoro'),
        shortBreak: document.getElementById('setting-shortBreak'),
        longBreak: document.getElementById('setting-longBreak'),
        longBreakInterval: document.getElementById('setting-longBreakInterval'),
        autoStartBreaks: document.getElementById('setting-autoStartBreaks'),
        autoStartPomodoros: document.getElementById('setting-autoStartPomodoros'),
        alarmSound: document.getElementById('setting-alarmSound'),
        tickingSound: document.getElementById('setting-tickingSound'),
        volume: document.getElementById('setting-volume'),
        darkMode: document.getElementById('setting-darkMode')
    },
    volumeDisplay: document.getElementById('volume-display'),

    // Auth
    authBtn: document.getElementById('auth-btn'),
    authUsername: document.getElementById('auth-username'),
    authModal: document.getElementById('auth-modal'),
    closeAuthBtn: document.getElementById('close-auth-btn'),
    authLoggedOutView: document.getElementById('auth-logged-out-view'),
    authLoggedInView: document.getElementById('auth-logged-in-view'),

    // Auth Forms/Buttons
    googleLoginBtn: document.getElementById('google-login-btn'),
    emailAuthForm: document.getElementById('email-auth-form'),
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    emailLoginBtn: document.getElementById('email-login-btn'),
    emailRegisterBtn: document.getElementById('email-register-btn'),
    authErrorMsg: document.getElementById('auth-error-msg'),
    logoutBtn: document.getElementById('logout-btn'),

    // User Display
    userDisplayName: document.getElementById('user-display-name'),
    userEmail: document.getElementById('user-email'),

    // Stats
    statTotalPomodoros: document.getElementById('stat-total-pomodoros'),
    statTodayTime: document.getElementById('stat-today-time'),

    // Compact Mode & PiP
    compactBtn: document.getElementById('compact-btn'),
    pipBtn: document.getElementById('pip-btn')
};
