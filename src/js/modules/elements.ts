export const elements = {
    body: document.body as HTMLBodyElement,
    html: document.documentElement as HTMLHtmlElement,
    timeDisplay: document.getElementById('time-display') as HTMLElement,
    mainBtn: document.getElementById('main-btn') as HTMLButtonElement,
    skipBtn: document.getElementById('skip-btn') as HTMLButtonElement,
    statusText: document.getElementById('status-text') as HTMLElement,
    modeBtns: document.querySelectorAll('.mode-btn') as NodeListOf<HTMLButtonElement>,
    progressCircle: document.querySelector('.progress-ring__circle') as SVGCircleElement,

    // Audio
    sounds: {
        bell: document.getElementById('bell-sound') as HTMLAudioElement,
        bird: document.getElementById('bird-sound') as HTMLAudioElement,
        digital: document.getElementById('digital-sound') as HTMLAudioElement,
        tick: document.getElementById('tick-sound') as HTMLAudioElement,
        rain: document.getElementById('rain-sound') as HTMLAudioElement
    },

    // Forms
    form: document.getElementById('add-task-form') as HTMLFormElement,
    taskInput: document.getElementById('task-input') as HTMLInputElement,
    estPomodorosInput: document.getElementById('est-pomodoros-input') as HTMLInputElement,
    taskList: document.getElementById('task-list') as HTMLElement,

    // Settings
    settingsBtn: document.getElementById('settings-btn') as HTMLButtonElement,
    settingsModal: document.getElementById('settings-modal') as HTMLElement,
    closeSettingsBtn: document.getElementById('close-settings-btn') as HTMLButtonElement,
    saveSettingsBtn: document.getElementById('save-settings-btn') as HTMLButtonElement,

    // Setting Inputs
    inputs: {
        pomodoro: document.getElementById('setting-pomodoro') as HTMLInputElement,
        shortBreak: document.getElementById('setting-shortBreak') as HTMLInputElement,
        longBreak: document.getElementById('setting-longBreak') as HTMLInputElement,
        longBreakInterval: document.getElementById('setting-longBreakInterval') as HTMLInputElement,
        autoStartBreaks: document.getElementById('setting-autoStartBreaks') as HTMLInputElement,
        autoStartPomodoros: document.getElementById('setting-autoStartPomodoros') as HTMLInputElement,
        alarmSound: document.getElementById('setting-alarmSound') as HTMLSelectElement,
        tickingSound: document.getElementById('setting-tickingSound') as HTMLSelectElement,
        volume: document.getElementById('setting-volume') as HTMLInputElement,
        darkMode: document.getElementById('setting-darkMode') as HTMLInputElement
    },
    volumeDisplay: document.getElementById('volume-display') as HTMLElement,

    // Auth
    authBtn: document.getElementById('auth-btn') as HTMLButtonElement,
    authUsername: document.getElementById('auth-username') as HTMLElement,
    authModal: document.getElementById('auth-modal') as HTMLElement,
    closeAuthBtn: document.getElementById('close-auth-btn') as HTMLButtonElement,
    authLoggedOutView: document.getElementById('auth-logged-out-view') as HTMLElement,
    authLoggedInView: document.getElementById('auth-logged-in-view') as HTMLElement,

    // Auth Forms/Buttons
    googleLoginBtn: document.getElementById('google-login-btn') as HTMLButtonElement,
    emailAuthForm: document.getElementById('email-auth-form') as HTMLFormElement,
    authEmail: document.getElementById('auth-email') as HTMLInputElement,
    authPassword: document.getElementById('auth-password') as HTMLInputElement,
    emailLoginBtn: document.getElementById('email-login-btn') as HTMLButtonElement,
    emailRegisterBtn: document.getElementById('email-register-btn') as HTMLButtonElement,
    authErrorMsg: document.getElementById('auth-error-msg') as HTMLElement,
    logoutBtn: document.getElementById('logout-btn') as HTMLButtonElement,

    // User Display
    userDisplayName: document.getElementById('user-display-name') as HTMLElement,
    userEmail: document.getElementById('user-email') as HTMLElement,
    syncIndicator: document.getElementById('sync-indicator') as HTMLElement,

    // Stats
    statTotalPomodoros: document.getElementById('stat-total-pomodoros') as HTMLElement,
    statTodayTime: document.getElementById('stat-today-time') as HTMLElement,

    // Timer Section
    timerSection: document.querySelector('.timer-section') as HTMLElement,

    // PiP
    pipBtn: document.getElementById('pip-btn') as HTMLButtonElement
};
