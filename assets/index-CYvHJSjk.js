const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.esm-4RLeqIEj.js","assets/index.esm-CAx1feN0.js","assets/index.esm-DyNCCC9q.js","assets/index.esm-CTiHkmY2.js"])))=>i.map(i=>d[i]);
true              &&(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
}());

const elements = {
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
  syncIndicator: document.getElementById('sync-indicator'),
  // Stats
  statTotalPomodoros: document.getElementById('stat-total-pomodoros'),
  statTodayTime: document.getElementById('stat-today-time'),
  // Timer Section
  timerSection: document.querySelector('.timer-section'),
  // PiP
  pipBtn: document.getElementById('pip-btn'),
  // Categories
  categoryFiltersContainer: document.getElementById('category-filters'),
  taskCategorySelect: document.getElementById('task-category-select'),
  categoryModal: document.getElementById('category-modal'),
  categoryNameInput: document.getElementById('category-name-input'),
  categoryColorOptions: document.getElementById('category-color-options'),
  categorySaveBtn: document.getElementById('category-save-btn'),
  categoryCancelBtn: document.getElementById('category-cancel-btn'),
  categoryCloseBtn: document.getElementById('close-category-btn'),
  // Archive
  openArchiveBtn: document.getElementById('open-archive-btn'),
  archiveCountBadge: document.getElementById('archive-count-badge'),
  archiveModal: document.getElementById('archive-modal'),
  archiveModalCount: document.getElementById('archive-modal-count'),
  closeArchiveBtn: document.getElementById('close-archive-btn'),
  archiveEmptyBtn: document.getElementById('archive-empty-btn'),
  archiveSearchInput: document.getElementById('archive-search-input'),
  archiveTaskList: document.getElementById('archive-task-list')
};

const DEFAULT_SETTINGS = {
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
};
const state = {
  mode: 'pomodoro',
  timeRemaining: 25 * 60,
  isRunning: false,
  timerId: null,
  pomodorosCompleted: 0,
  tasks: [],
  activeTaskId: null,
  categories: [],
  selectedCategoryFilter: 'all',
  settings: {
    ...DEFAULT_SETTINGS
  },
  focusHistory: {}
};

// Event listener for state changes (e.g., for syncing)
const stateEvents = {
  onStateChange: _state => {}
};

/**
 * Notifies that the state has changed and triggers a sync if needed
 */
function notifyStateChange() {
  stateEvents.onStateChange(state);
}
function loadSettings() {
  const saved = localStorage.getItem('pomodoro_settings');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.settings) {
        state.settings = {
          ...state.settings,
          ...data.settings
        };
      } else if (data.pomodoro) {
        // legacy format check
        state.settings = {
          ...state.settings,
          ...data
        };
      }
      state.focusHistory = data.focusHistory || {};
    } catch (e) {
      console.error("Failed to parse pomodoro_settings from localStorage", e);
    }
  }
}
function saveSettings$1() {
  // Limit focusHistory to last 365 days
  const historyKeys = Object.keys(state.focusHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
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
function resetLocalState() {
  state.tasks = [];
  state.activeTaskId = null;
  state.categories = [];
  state.selectedCategoryFilter = 'all';
  state.settings = {
    ...DEFAULT_SETTINGS
  };
  state.focusHistory = {};
  localStorage.removeItem('pomodoro_tasks');
  localStorage.removeItem('pomodoro_categories');
  localStorage.removeItem('pomodoro_settings');
}

function playAlarm() {
  const alarmSound = state.settings.alarmSound;
  const sound = elements.sounds[alarmSound];
  if (sound) {
    if (!sound.src && sound.dataset.src) {
      sound.src = sound.dataset.src;
      sound.load();
    }
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Audio blocked', e));
  }
}
function toggleBackgroundSound(play) {
  if (elements.sounds.tick) elements.sounds.tick.pause();
  if (elements.sounds.rain) elements.sounds.rain.pause();
  if (play && state.settings.tickingSound !== 'none') {
    const tickingSound = state.settings.tickingSound;
    // Since tickingSound can be 'none' | 'tick' | 'rain', and elements.sounds has keys bell, bird, digital, tick, rain.
    if (tickingSound === 'tick' || tickingSound === 'rain') {
      const sound = elements.sounds[tickingSound];
      if (sound) {
        if (!sound.src && sound.dataset.src) {
          sound.src = sound.dataset.src;
          sound.load();
        }
        sound.loop = true;
        sound.play().catch(e => console.log('Audio blocked', e));
      }
    }
  }
}
function updateVolume() {
  const vol = state.settings.volume / 100;
  Object.values(elements.sounds).forEach(audio => {
    if (audio) audio.volume = vol;
  });
}

/**
 * Utility functions for FocusTimer
 */

/**
 * Escapes HTML characters in a string to prevent XSS injection
 * @param {string} str - Input string to escape
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Checks if the user is currently typing in an input, textarea or contenteditable element
 * @param {KeyboardEvent} e - Keyboard event
 * @returns {boolean}
 */
function isUserTyping(e) {
  const target = e.target;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/**
 * Simple debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Traps focus inside a modal element
 * @param {KeyboardEvent} e - Keyboard event
 * @param {HTMLElement} modalElement - The modal wrapper
 */
function trapFocus(e, modalElement) {
  if (e.key !== 'Tab') return;
  const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length === 0) return;
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }
}
/**
 * Custom confirm modal
 * @param {string} message - Message to display
 * @param {ConfirmOptions} [options] - Optional custom title, button labels, and style
 * @returns {Promise<boolean>}
 */
function customConfirm(message, options) {
  return new Promise(resolve => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok-btn');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const iconWrap = document.getElementById('confirm-icon-wrap');
    if (!modal || !msgEl || !okBtn || !cancelBtn) {
      // Fallback if modal not in DOM
      resolve(window.confirm(message));
      return;
    }
    const isDanger = options?.isDanger ?? /xóa|delete|hủy|không thể hoàn tác/i.test(message);
    const title = options?.title ?? (isDanger ? 'Xác nhận thao tác xóa' : 'Xác nhận thao tác');
    const confirmText = options?.confirmText ?? (isDanger ? 'Xác nhận xóa' : 'Xác nhận');
    const cancelText = options?.cancelText ?? 'Hủy bỏ';
    if (titleEl) titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    if (iconWrap) {
      if (isDanger) {
        iconWrap.className = 'confirm-icon-wrap danger';
        iconWrap.innerHTML = `
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                `;
        okBtn.className = 'confirm-btn-confirm danger';
      } else {
        iconWrap.className = 'confirm-icon-wrap info';
        iconWrap.innerHTML = `
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                `;
        okBtn.className = 'confirm-btn-confirm primary';
      }
    }
    modal.classList.remove('hidden');
    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKeyDown);
    };
    const onOk = () => {
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      cleanup();
      resolve(false);
    };
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        cleanup();
        resolve(false);
      }
    };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeyDown);
  });
}

let sessionStartTime = null;
let sessionAccumulatedMs = 0;
let targetEndTime = null;
const timerEvents = {
  onPomodoroComplete: () => {},
  onPomodoroStart: null // returns true if start should proceed
};

// Progress Circle setup
const radius = elements.progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
elements.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
elements.progressCircle.style.strokeDashoffset = '0';
function setProgress(percent) {
  const offset = circumference - percent / 100 * circumference;
  elements.progressCircle.style.strokeDashoffset = String(offset);
}

// --- Favicon Helper ---
function updateFavicon(mode) {
  const color = mode === 'pomodoro' ? '#ba4949' : mode === 'shortBreak' ? '#38858a' : '#397097';
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
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function updateDisplay() {
  elements.timeDisplay.textContent = formatTime(state.timeRemaining);
  const totalTime = state.settings[state.mode] * 60;
  const mathPercent = Math.max(0, state.timeRemaining / totalTime);
  const percentage = mathPercent * 100;
  setProgress(100 - percentage);
  document.title = `${formatTime(state.timeRemaining)} - ${getModeName(state.mode)}`;
}
function getModeName(mode) {
  switch (mode) {
    case 'pomodoro':
      return 'Focus';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    default:
      return 'Pomodoro';
  }
}
async function setMode(mode) {
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
  targetEndTime = sessionStartTime + state.timeRemaining * 1000;
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
    sessionAccumulatedMs += Date.now() - sessionStartTime;
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
async function toggleTimer() {
  if (state.isRunning) {
    stopTimer();
  } else {
    await startTimer();
  }
}
async function skipPhase() {
  if (state.isRunning) {
    const wantsToSkip = await customConfirm("Are you sure you want to skip the current phase?");
    if (!wantsToSkip) return;
  }
  // handleTimerComplete already calls stopTimer(true)
  handleTimerComplete(true);
}
function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'favicon.ico'
    });
  }
}
function handleTimerComplete(isSkipped = false) {
  stopTimer(true);
  if (!isSkipped) playAlarm();
  if (state.mode === 'pomodoro') {
    if (!isSkipped) {
      state.pomodorosCompleted++;

      // Record Analytics
      const today = new Date().toLocaleDateString('en-CA');
      if (!state.focusHistory[today]) {
        state.focusHistory[today] = {
          seconds: 0,
          pomodoros: 0
        };
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

const DEFAULT_CATEGORIES = [{
  id: 'cat_work',
  name: 'Work',
  color: '#4F46E5',
  isDefault: true
}, {
  id: 'cat_study',
  name: 'Study',
  color: '#06B6D4',
  isDefault: true
}, {
  id: 'cat_personal',
  name: 'Personal',
  color: '#10B981',
  isDefault: true
}, {
  id: 'cat_general',
  name: 'General',
  color: '#6B7280',
  isDefault: true
}];
const CATEGORY_COLORS = ['#4F46E5',
// Indigo
'#06B6D4',
// Cyan
'#10B981',
// Emerald
'#F59E0B',
// Amber
'#F43F5E',
// Rose
'#8B5CF6',
// Purple
'#6B7280',
// Gray
'#2563EB' // Blue
];
const categoryEvents = {
  onCategoryChanged: () => {}
};
function loadCategories() {
  const saved = localStorage.getItem('pomodoro_categories');
  if (saved) {
    try {
      state.categories = JSON.parse(saved);
    } catch (e) {
      state.categories = [...DEFAULT_CATEGORIES];
    }
  } else {
    state.categories = [...DEFAULT_CATEGORIES];
  }
  if (!state.categories || state.categories.length === 0) {
    state.categories = [...DEFAULT_CATEGORIES];
  }
  renderCategoryFilters();
  renderCategoryOptions();
}
function saveCategories() {
  localStorage.setItem('pomodoro_categories', JSON.stringify(state.categories));
}
function getCategoryById(id) {
  if (!id) return state.categories.find(c => c.id === 'cat_general') || DEFAULT_CATEGORIES[3];
  return state.categories.find(c => c.id === id) || state.categories.find(c => c.id === 'cat_general') || DEFAULT_CATEGORIES[3];
}
function addCategory(name, color) {
  const trimmed = name.trim().substring(0, 30);
  if (!trimmed) return null;
  const exists = state.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return null;
  const newCategory = {
    id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: trimmed,
    color: color || '#6B7280'
  };
  state.categories.push(newCategory);
  saveCategories();
  renderCategoryFilters();
  renderCategoryOptions();
  notifyStateChange();
  categoryEvents.onCategoryChanged();
  return newCategory;
}
function setCategoryFilter(id) {
  state.selectedCategoryFilter = id;
  renderCategoryFilters();
  categoryEvents.onCategoryChanged();
}
function renderCategoryFilters() {
  if (!elements.categoryFiltersContainer) return;
  if (!state.categories || state.categories.length === 0) {
    state.categories = [...DEFAULT_CATEGORIES];
  }
  elements.categoryFiltersContainer.innerHTML = '';

  // 'All' button
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `category-filter-btn ${state.selectedCategoryFilter === 'all' ? 'active' : ''}`;
  allBtn.textContent = 'All';
  allBtn.onclick = () => setCategoryFilter('all');
  elements.categoryFiltersContainer.appendChild(allBtn);

  // Specific category buttons
  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `category-filter-btn ${state.selectedCategoryFilter === cat.id ? 'active' : ''}`;
    btn.setAttribute('data-category-id', cat.id);
    const safeName = escapeHtml(cat.name);
    btn.innerHTML = `<span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeName}</span>`;
    btn.onclick = () => setCategoryFilter(cat.id);
    elements.categoryFiltersContainer.appendChild(btn);
  });

  // Add category button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'category-filter-add-btn';
  addBtn.title = 'Add Category';
  addBtn.setAttribute('aria-label', 'Add Category');
  addBtn.innerHTML = '+';
  addBtn.onclick = () => {
    if (elements.categoryModal) {
      elements.categoryModal.classList.remove('hidden');
      if (elements.categoryNameInput) {
        elements.categoryNameInput.value = '';
        elements.categoryNameInput.focus();
      }
    }
  };
  elements.categoryFiltersContainer.appendChild(addBtn);
}
function renderCategoryOptions() {
  if (!elements.taskCategorySelect) return;
  if (!state.categories || state.categories.length === 0) {
    state.categories = [...DEFAULT_CATEGORIES];
  }
  elements.taskCategorySelect.innerHTML = '';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    if (cat.id === (state.selectedCategoryFilter !== 'all' ? state.selectedCategoryFilter : 'cat_general')) {
      opt.selected = true;
    }
    elements.taskCategorySelect.appendChild(opt);
  });
}

const taskEvents = {
  onTaskActivated: () => {}
};
categoryEvents.onCategoryChanged = () => {
  renderTasks();
};
function getFirstIncompleteTask() {
  return state.tasks.find(t => !t.isCompleted && !t.isArchived) || null;
}
function loadTasks() {
  const saved = localStorage.getItem('pomodoro_tasks');
  if (saved) {
    try {
      state.tasks = JSON.parse(saved);
    } catch (e) {
      state.tasks = [];
    }
    const active = state.tasks.find(t => t.isActive && !t.isArchived);
    if (active) state.activeTaskId = active.id;else state.activeTaskId = null;
    renderTasks();
  }
  updateArchiveBadgeCount();
}
function saveTasks() {
  localStorage.setItem('pomodoro_tasks', JSON.stringify(state.tasks));
}
function addTask(title, estPomodoros, categoryId) {
  title = title.substring(0, 200);
  const isFirstTask = state.tasks.length === 0;
  const taskId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const est = typeof estPomodoros === 'string' ? parseInt(estPomodoros) : estPomodoros;

  // If not explicitly provided, use current filter if specific, else General
  let selectedCategory = categoryId;
  if (!selectedCategory) {
    if (state.selectedCategoryFilter && state.selectedCategoryFilter !== 'all') {
      selectedCategory = state.selectedCategoryFilter;
    } else if (elements.taskCategorySelect && elements.taskCategorySelect.value) {
      selectedCategory = elements.taskCategorySelect.value;
    } else {
      selectedCategory = 'cat_general';
    }
  }
  const newTask = {
    id: taskId,
    title,
    estPomodoros: Math.min(100, Math.max(1, est || 1)),
    actualPomodoros: 0,
    isCompleted: false,
    isActive: isFirstTask,
    categoryId: selectedCategory
  };
  if (isFirstTask) state.activeTaskId = newTask.id;
  state.tasks.push(newTask);
  saveTasks();
  renderTasks();
  notifyStateChange();
}
function toggleTaskComplete(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.isCompleted = !task.isCompleted;
    if (task.isCompleted && task.isActive) {
      task.isActive = false;
      state.activeTaskId = null;
    }
    saveTasks();
    renderTasks();
    notifyStateChange();
  }
}
function setActiveTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task && !task.isCompleted) {
    state.tasks.forEach(t => t.isActive = false);
    task.isActive = true;
    state.activeTaskId = id;
    saveTasks();
    renderTasks();
    notifyStateChange();
    taskEvents.onTaskActivated();
  }
}
function deleteTask(id) {
  // Instead of deleting, archive the task
  archiveTask(id);
}
function archiveTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.isArchived = true;
    task.archivedAt = Date.now();
    if (state.activeTaskId === id) {
      state.activeTaskId = null;
    }
    saveTasks();
    renderTasks();
    renderArchiveModal(elements.archiveSearchInput ? elements.archiveSearchInput.value : '');
    notifyStateChange();
  }
}
function restoreTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.isArchived = false;
    saveTasks();
    renderTasks();
    renderArchiveModal(elements.archiveSearchInput ? elements.archiveSearchInput.value : '');
    notifyStateChange();
  }
}
function deletePermanently(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  if (state.activeTaskId === id) {
    state.activeTaskId = null;
  }
  saveTasks();
  renderTasks();
  renderArchiveModal(elements.archiveSearchInput ? elements.archiveSearchInput.value : '');
  notifyStateChange();
}
function emptyArchivedTasks() {
  state.tasks = state.tasks.filter(t => !t.isArchived);
  saveTasks();
  renderTasks();
  renderArchiveModal();
  notifyStateChange();
}
function updateArchiveBadgeCount() {
  const count = state.tasks ? state.tasks.filter(t => t.isArchived).length : 0;
  if (elements.archiveCountBadge) {
    elements.archiveCountBadge.textContent = count.toString();
    if (count > 0) {
      elements.archiveCountBadge.classList.add('has-items');
    } else {
      elements.archiveCountBadge.classList.remove('has-items');
    }
  }
  if (elements.archiveModalCount) {
    elements.archiveModalCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
  }
}
function renderArchiveModal(searchQuery = '') {
  updateArchiveBadgeCount();
  if (!elements.archiveTaskList) return;
  const archivedTasks = (state.tasks || []).filter(t => t.isArchived);
  const query = searchQuery.trim().toLowerCase();
  const filtered = query ? archivedTasks.filter(t => t.title.toLowerCase().includes(query)) : archivedTasks;
  if (filtered.length === 0) {
    const emptyMsg = query ? 'Không tìm thấy công việc phù hợp.' : 'Chưa có công việc nào được lưu trữ.';
    elements.archiveTaskList.innerHTML = `
            <div class="archive-empty-state">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                </svg>
                <p>${emptyMsg}</p>
            </div>
        `;
    return;
  }
  elements.archiveTaskList.innerHTML = '';
  filtered.forEach(task => {
    const item = document.createElement('div');
    item.className = `archive-task-item ${task.isCompleted ? 'completed' : ''}`;
    item.setAttribute('data-task-id', task.id);
    const sanitizedTitle = escapeHtml(task.title);
    const cat = getCategoryById(task.categoryId);
    const safeCatName = escapeHtml(cat.name);
    item.innerHTML = `
            <div class="archive-task-check">
                <svg viewBox="0 0 448 512" width="12" height="12" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
            </div>
            <div class="archive-task-info">
                <div class="archive-task-title">
                    <span class="task-title-text">${sanitizedTitle}</span>
                    <span class="task-category-badge-static">
                        <span class="category-dot" style="background-color: ${cat.color}"></span>
                        <span>${safeCatName}</span>
                    </span>
                </div>
                <div class="archive-task-stats">${task.actualPomodoros} / ${task.estPomodoros} ${task.actualPomodoros === 1 && task.estPomodoros === 1 ? 'pomodoro' : 'pomodoros'}</div>
            </div>
            <div class="archive-task-actions">
                <button class="action-btn restore-btn" data-action="restore" data-id="${task.id}" title="Khôi phục về danh sách chính" aria-label="Restore task">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                </button>
                <button class="action-btn delete-btn delete-permanent-btn" data-action="delete-permanent" data-id="${task.id}" title="Xóa vĩnh viễn" aria-label="Delete permanently">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </div>
        `;
    elements.archiveTaskList.appendChild(item);
  });
}
function updateTaskCategory(taskId, categoryId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task && task.categoryId !== categoryId) {
    task.categoryId = categoryId;
    saveTasks();
    renderTasks();
    notifyStateChange();
  }
}
function updateTaskPomodoros() {
  if (!state.activeTaskId) return;
  const task = state.tasks.find(t => t.id === state.activeTaskId);
  if (task) {
    task.actualPomodoros++;
    saveTasks();
    renderTasks();
    notifyStateChange();
  }
}
function renderTasks() {
  if (elements.form) {
    elements.form.style.display = 'flex';
  }
  const activeTasks = state.tasks.filter(t => !t.isArchived);
  const filteredTasks = state.selectedCategoryFilter === 'all' ? activeTasks : activeTasks.filter(t => (t.categoryId || 'cat_general') === state.selectedCategoryFilter);
  updateArchiveBadgeCount();
  if (filteredTasks.length === 0) {
    const msg = activeTasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks in this category.';
    elements.taskList.innerHTML = `<div style="text-align: center; color: var(--clr-text-muted); font-size: 0.9rem; padding: 1.5rem 0;">${msg}</div>`;
    return;
  }
  const emptyMsg = elements.taskList.querySelector('div[style]');
  if (emptyMsg) emptyMsg.remove();
  const existingElements = Array.from(elements.taskList.children);
  const existingMap = new Map();
  existingElements.forEach(el => {
    const checkBtn = el.querySelector('[data-action="toggle"]');
    if (checkBtn && checkBtn.dataset.id) {
      existingMap.set(checkBtn.dataset.id, el);
    } else {
      el.remove();
    }
  });
  let currentSibling = null;
  filteredTasks.forEach(task => {
    let item = existingMap.get(task.id);
    const sanitizedTitle = escapeHtml(task.title);
    const cat = getCategoryById(task.categoryId);
    const safeCatName = escapeHtml(cat.name);
    const categoryBadgeHtml = `<button type="button" class="task-category-badge" data-action="change-category" data-id="${task.id}" title="Click to change category" aria-label="Category: ${safeCatName}"><span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeCatName}</span><svg class="category-chevron" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 9l6 6 6-6"/></svg></button>`;
    const titleWithBadge = `<span class="task-title-text">${sanitizedTitle}</span> ${categoryBadgeHtml}`;
    const statsText = `${task.actualPomodoros} / ${task.estPomodoros} ${task.actualPomodoros === 1 && task.estPomodoros === 1 ? 'pomodoro' : 'pomodoros'}`;
    const actionsHtml = `
            <button class="action-btn archive-btn" data-action="archive" data-id="${task.id}" title="Lưu trữ công việc" aria-label="Archive Task">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            </button>
        `;
    if (!item) {
      item = document.createElement('div');
      item.className = `task-item ${task.isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}`;
      item.innerHTML = `
                <div class="task-check" data-action="toggle" data-id="${task.id}" title="Toggle completion">
                    <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                </div>
                <div class="task-content" data-action="activate" data-id="${task.id}" draggable="true">
                    <div class="task-text">${titleWithBadge}</div>
                    <div class="task-stats">${statsText}</div>
                </div>
                <div class="task-actions">
                    ${actionsHtml}
                </div>
            `;
      item.setAttribute('data-task-id', task.id);
      item.addEventListener('dragstart', e => {
        if (item) item.classList.add('dragging');
        if (e && e.dataTransfer) {
          try {
            e.dataTransfer.setData('text/plain', task.id);
          } catch (_) {}
          e.dataTransfer.effectAllowed = 'move';
        }
      });
      item.addEventListener('dragend', () => {
        if (item) {
          item.classList.remove('dragging');
          document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
        }
      });
      item.addEventListener('dragover', e => {
        e.preventDefault();
        if (item) {
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          item.classList.add('drag-over');
        }
      });
      item.addEventListener('dragleave', () => {
        if (item) item.classList.remove('drag-over');
      });
      item.addEventListener('drop', e => {
        e.preventDefault();
        let draggedId = '';
        if (e.dataTransfer) {
          try {
            draggedId = e.dataTransfer.getData('text/plain');
          } catch (_) {}
        }
        if (!draggedId) {
          const draggingEl = document.querySelector('.task-item.dragging');
          if (draggingEl) draggedId = draggingEl.getAttribute('data-task-id') || '';
        }
        if (draggedId && draggedId !== task.id) reorderTasks(draggedId, task.id);
      });
    } else {
      item.className = `task-item ${task.isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}`;
      const textEl = item.querySelector('.task-text');
      if (textEl && textEl.innerHTML !== titleWithBadge) textEl.innerHTML = titleWithBadge;
      const statsEl = item.querySelector('.task-stats');
      if (statsEl && statsEl.textContent !== statsText) statsEl.textContent = statsText;
      const actionsEl = item.querySelector('.task-actions');
      if (actionsEl && actionsEl.innerHTML.trim() !== actionsHtml.trim()) {
        actionsEl.innerHTML = actionsHtml;
      }
      existingMap.delete(task.id);
    }
    if (!currentSibling) {
      if (elements.taskList.firstChild !== item) elements.taskList.prepend(item);
    } else {
      if (currentSibling.nextSibling !== item) currentSibling.after(item);
    }
    currentSibling = item;
  });
  existingMap.forEach(item => item.remove());
}
function reorderTasks(draggedId, targetId) {
  const draggedIndex = state.tasks.findIndex(t => t.id === draggedId);
  const targetIndex = state.tasks.findIndex(t => t.id === targetId);
  if (draggedIndex !== -1 && targetIndex !== -1) {
    const [draggedTask] = state.tasks.splice(draggedIndex, 1);
    state.tasks.splice(targetIndex, 0, draggedTask);
    saveTasks();
    renderTasks();
    notifyStateChange();
  }
}

function applySettingsToUI() {
  elements.inputs.pomodoro.value = String(state.settings.pomodoro);
  elements.inputs.shortBreak.value = String(state.settings.shortBreak);
  elements.inputs.longBreak.value = String(state.settings.longBreak);
  elements.inputs.longBreakInterval.value = String(state.settings.longBreakInterval);
  elements.inputs.autoStartBreaks.checked = state.settings.autoStartBreaks;
  elements.inputs.autoStartPomodoros.checked = state.settings.autoStartPomodoros;
  elements.inputs.alarmSound.value = state.settings.alarmSound;
  elements.inputs.tickingSound.value = state.settings.tickingSound;
  elements.inputs.volume.value = String(state.settings.volume);
  elements.volumeDisplay.textContent = String(state.settings.volume);
  elements.inputs.darkMode.checked = state.settings.darkMode;
}
function applyTheme() {
  if (state.settings.darkMode) {
    elements.html.removeAttribute('data-theme');
  } else {
    elements.html.setAttribute('data-theme', 'light');
  }
}
function saveSettings() {
  state.settings.pomodoro = Math.min(90, Math.max(1, parseInt(elements.inputs.pomodoro.value) || 25));
  state.settings.shortBreak = Math.min(30, Math.max(1, parseInt(elements.inputs.shortBreak.value) || 5));
  state.settings.longBreak = Math.min(60, Math.max(1, parseInt(elements.inputs.longBreak.value) || 15));
  state.settings.longBreakInterval = Math.min(10, Math.max(1, parseInt(elements.inputs.longBreakInterval.value) || 4));
  state.settings.autoStartBreaks = elements.inputs.autoStartBreaks.checked;
  state.settings.autoStartPomodoros = elements.inputs.autoStartPomodoros.checked;
  state.settings.alarmSound = elements.inputs.alarmSound.value;
  state.settings.tickingSound = elements.inputs.tickingSound.value;
  state.settings.volume = parseInt(elements.inputs.volume.value);
  state.settings.darkMode = elements.inputs.darkMode.checked;
  saveSettings$1();
  applyTheme();
  updateVolume();
  if (!state.isRunning) {
    setMode(state.mode);
  }
  notifyStateChange();
}
function toggleSettingsModal(show) {
  if (show) {
    applySettingsToUI();
    elements.settingsModal.classList.remove('hidden');
  } else {
    elements.settingsModal.classList.add('hidden');
  }
}

const scriptRel = 'modulepreload';const assetsURL = function(dep) { return "/pomodoro/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (true               && deps && deps.length > 0) {
		document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises$2) {
			return Promise.all(promises$2.map((p) => Promise.resolve(p).then((value$1) => ({
				status: "fulfilled",
				value: value$1
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err$2) {
		const e$1 = new Event("vite:preloadError", { cancelable: true });
		e$1.payload = err$2;
		window.dispatchEvent(e$1);
		if (!e$1.defaultPrevented) throw err$2;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};

const env = {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBquo9eoROYOBPujh_tiZBjw0OjZbPQCS4",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "pomodoro-web-1dc50.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "pomodoro-web-1dc50",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "pomodoro-web-1dc50.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944405715848",
  appId: env.VITE_FIREBASE_APP_ID || "1:944405715848:web:0896a081881c340e96783d"
};
let app = null;
let auth = null;
let db = null;
let googleProvider = null;
async function initFirebase() {
  if (app && auth && db && googleProvider) return {
    app,
    auth,
    db,
    googleProvider
  };
  try {
    const [{
      initializeApp
    }, {
      getAuth,
      GoogleAuthProvider: GAP
    }, {
      getFirestore
    }] = await Promise.all([__vitePreload(() => import('./index.esm-4RLeqIEj.js'),true              ?__vite__mapDeps([0,1]):void 0), __vitePreload(() => import('./index.esm-DyNCCC9q.js'),true              ?__vite__mapDeps([2,1]):void 0), __vitePreload(() => import('./index.esm-CTiHkmY2.js'),true              ?__vite__mapDeps([3,1]):void 0)]);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GAP();
    console.log("Firebase modular SDK initialized (Lazy Loaded).");
    return {
      app,
      auth,
      db,
      googleProvider
    };
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    return null;
  }
}
function getAuthRef() {
  return auth;
}
function getDbRef() {
  return db;
}
function getGoogleProviderRef() {
  return googleProvider;
}

function updateStatsUI() {
  const today = new Date().toLocaleDateString('en-CA');
  const todayData = state.focusHistory[today] || {
    seconds: 0};

  // Calculate total pomodoros across all history
  const totalPomodoros = Object.values(state.focusHistory).reduce((acc, curr) => acc + curr.pomodoros, 0);

  // Format today's time
  const hours = Math.floor(todayData.seconds / 3600);
  const minutes = Math.floor(todayData.seconds % 3600 / 60);
  elements.statTotalPomodoros.textContent = String(totalPomodoros);
  elements.statTodayTime.textContent = `${hours}h ${minutes}m`;
}

const syncEvents = {
  onSyncStatusChange: _status => {}
};
let isSyncing = false;
let isLoadingFromCloud = false;
let unsubscribeSnapshot = null;
async function syncDataToCloud(user) {
  if (!user || isSyncing || isLoadingFromCloud) return;
  isSyncing = true;
  const db = getDbRef();
  if (!db) {
    isSyncing = false;
    return;
  }
  syncEvents.onSyncStatusChange('syncing');
  try {
    const {
      doc,
      setDoc,
      serverTimestamp
    } = await __vitePreload(async () => { const {
      doc,
      setDoc,
      serverTimestamp
    } = await import('./index.esm-CTiHkmY2.js');return {
      doc,
      setDoc,
      serverTimestamp
    }},true              ?__vite__mapDeps([3,1]):void 0);
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      tasks: state.tasks,
      categories: state.categories,
      settings: state.settings,
      focusHistory: state.focusHistory,
      lastSynced: serverTimestamp()
    }, {
      merge: true
    });
    syncEvents.onSyncStatusChange('synced');
    console.log("Data synced to cloud successfully.");
  } catch (e) {
    syncEvents.onSyncStatusChange('error');
    console.error("Error syncing to cloud:", e);
  } finally {
    isSyncing = false;
  }
}
async function setupRealtimeSync(user) {
  if (!user) return;
  const db = getDbRef();
  if (!db) return;
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  try {
    const {
      doc,
      onSnapshot
    } = await __vitePreload(async () => { const {
      doc,
      onSnapshot
    } = await import('./index.esm-CTiHkmY2.js');return {
      doc,
      onSnapshot
    }},true              ?__vite__mapDeps([3,1]):void 0);
    const userRef = doc(db, 'users', user.uid);
    unsubscribeSnapshot = onSnapshot(userRef, docSnap => {
      if (isSyncing) return; // Prevent loop when local change initiated write
      if (docSnap.exists()) {
        const data = docSnap.data();
        isLoadingFromCloud = true;

        // Merge Settings
        if (data.settings && typeof data.settings === 'object') {
          state.settings = {
            ...state.settings,
            ...data.settings
          };
          applySettingsToUI();
          applyTheme();
          updateVolume();
          if (!state.isRunning) {
            setMode(state.mode);
          }
        }

        // Merge Tasks (Smart Union)
        if (Array.isArray(data.tasks)) {
          const localTasks = state.tasks;
          const cloudTasks = data.tasks;
          const cloudTaskIds = new Set(cloudTasks.map(t => t.id));
          const mergedTasks = [...cloudTasks];
          localTasks.forEach(t => {
            if (!cloudTaskIds.has(t.id)) {
              mergedTasks.push(t);
            }
          });
          state.tasks = mergedTasks;
          const active = state.tasks.find(t => t.isActive && !t.isArchived);
          state.activeTaskId = active ? active.id : null;
          saveTasks();
          renderTasks();
          if (elements.archiveModal && !elements.archiveModal.classList.contains('hidden')) {
            const searchVal = elements.archiveSearchInput ? elements.archiveSearchInput.value : '';
            renderArchiveModal(searchVal);
          }
        }

        // Merge Categories
        if (Array.isArray(data.categories)) {
          state.categories = data.categories;
          saveCategories();
          renderCategoryFilters();
          renderCategoryOptions();
        }

        // Merge Focus History
        if (data.focusHistory && typeof data.focusHistory === 'object') {
          state.focusHistory = {
            ...state.focusHistory,
            ...data.focusHistory
          };
          updateStatsUI();
        }
        syncEvents.onSyncStatusChange('synced');
        isLoadingFromCloud = false;
      }
    }, err => {
      console.error("Realtime sync error:", err);
      syncEvents.onSyncStatusChange('error');
    });
  } catch (e) {
    console.error("Failed to setup realtime sync listener:", e);
  }
}
function unsubscribeRealtimeSync() {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
}

let currentUser = null;
async function initAuth() {
  await initFirebase();
  const auth = getAuthRef();
  if (!auth) return;
  const {
    onAuthStateChanged
  } = await __vitePreload(async () => { const {
    onAuthStateChanged
  } = await import('./index.esm-DyNCCC9q.js');return {
    onAuthStateChanged
  }},true              ?__vite__mapDeps([2,1]):void 0);

  // Listen for auth state changes
  onAuthStateChanged(auth, async user => {
    const wasLoggedIn = !!currentUser;
    currentUser = user;
    if (user) {
      console.log("User logged in:", user.email);
      showLoggedInView(user);
      if (window.lucide) window.lucide.createIcons();
      await setupRealtimeSync(user);
    } else {
      console.log("User logged out");
      unsubscribeRealtimeSync();
      showLoggedOutView(wasLoggedIn);
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // Event Listeners
  elements.authBtn.addEventListener('click', () => toggleAuthModal(true));
  elements.closeAuthBtn.addEventListener('click', () => toggleAuthModal(false));
  elements.googleLoginBtn.addEventListener('click', signInWithGoogle);
  elements.emailLoginBtn.addEventListener('click', e => handleEmailAuth(e, 'login'));
  elements.emailRegisterBtn.addEventListener('click', e => handleEmailAuth(e, 'register'));
  syncEvents.onSyncStatusChange = status => {
    updateSyncUI(status);
  };
  elements.logoutBtn.addEventListener('click', signOut);
}
function getCurrentUser() {
  return currentUser;
}
function toggleAuthModal(show) {
  if (show) {
    elements.authErrorMsg.style.display = 'none';
    elements.authModal.classList.remove('hidden');
  } else {
    elements.authModal.classList.add('hidden');
  }
}
function showLoggedInView(user) {
  elements.authLoggedOutView.style.display = 'none';
  elements.authLoggedInView.style.display = 'block';
  const displayName = user.displayName || 'Focus Timer User';
  elements.userDisplayName.textContent = displayName;
  elements.userEmail.textContent = user.email || '';
  elements.authUsername.textContent = displayName.split(' ')[0];
  elements.authUsername.style.display = 'inline';
}
function showLoggedOutView(shouldResetState = false) {
  elements.authLoggedInView.style.display = 'none';
  elements.authLoggedOutView.style.display = 'block';
  elements.authEmail.value = '';
  elements.authPassword.value = '';
  elements.authUsername.style.display = 'none';
  updateSyncUI('none');
  if (shouldResetState) {
    resetLocalState();
    loadCategories();
    renderTasks();
    updateStatsUI();
    applySettingsToUI();
  }
}
function updateSyncUI(status) {
  const indicator = elements.syncIndicator;
  if (!indicator) return;
  indicator.classList.remove('syncing', 'synced', 'error');
  if (status === 'syncing') {
    indicator.textContent = 'Syncing...';
    indicator.classList.add('syncing');
  } else if (status === 'synced') {
    indicator.textContent = 'Synced';
    indicator.classList.add('synced');
  } else if (status === 'error') {
    indicator.textContent = 'Sync Error';
    indicator.classList.add('error');
  } else if (status === 'none') {
    indicator.textContent = 'Not Logged In';
  }
}
function showError(msg) {
  elements.authErrorMsg.textContent = msg;
  elements.authErrorMsg.style.display = 'block';
}
async function signInWithGoogle() {
  await initFirebase();
  const auth = getAuthRef();
  const provider = getGoogleProviderRef();
  if (!auth || !provider) return showError("Firebase credentials not configured.");
  const {
    signInWithPopup
  } = await __vitePreload(async () => { const {
    signInWithPopup
  } = await import('./index.esm-DyNCCC9q.js');return {
    signInWithPopup
  }},true              ?__vite__mapDeps([2,1]):void 0);
  try {
    await signInWithPopup(auth, provider);
    toggleAuthModal(false);
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      // Silently ignore user closing popup
      return;
    } else if (error.code === 'auth/popup-blocked') {
      showError("Popup blocked by browser. Please allow popups for this site.");
    } else {
      showError(error.message || "Failed to sign in with Google.");
    }
  }
}
async function handleEmailAuth(e, action) {
  e.preventDefault();
  if (!elements.emailAuthForm.checkValidity()) {
    elements.emailAuthForm.reportValidity();
    return;
  }
  await initFirebase();
  const auth = getAuthRef();
  if (!auth) return showError("Firebase not configured");
  const email = elements.authEmail.value;
  const password = elements.authPassword.value;
  const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
  } = await __vitePreload(async () => { const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
  } = await import('./index.esm-DyNCCC9q.js');return {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
  }},true              ?__vite__mapDeps([2,1]):void 0);
  try {
    if (action === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    toggleAuthModal(false);
  } catch (error) {
    let cleanMsg = "An error occurred. Please try again.";
    if (error.code === 'auth/email-already-in-use') cleanMsg = "Email already in use.";else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') cleanMsg = "Invalid email or password.";else if (error.code === 'auth/too-many-requests') cleanMsg = "Too many attempts. Please try again later.";else if (error.code === 'auth/weak-password') cleanMsg = "Password is too weak. Must be at least 6 characters.";else if (error.code === 'auth/invalid-email') cleanMsg = "Invalid email format.";
    showError(cleanMsg);
  }
}
async function signOut() {
  const auth = getAuthRef();
  if (!auth) return;
  const {
    signOut: firebaseSignOut
  } = await __vitePreload(async () => { const {
    signOut: firebaseSignOut
  } = await import('./index.esm-DyNCCC9q.js');return {
    signOut: firebaseSignOut
  }},true              ?__vite__mapDeps([2,1]):void 0);
  try {
    unsubscribeRealtimeSync();
    await firebaseSignOut(auth);
    toggleAuthModal(false);
  } catch (error) {
    console.error("Sign out error", error);
  }
}

let pipWindow = null;
let timerParent = null;
let pipCleanups = [];
function isPiPSupported() {
  return 'documentPictureInPicture' in window;
}
function initPiP() {
  if (isPiPSupported()) {
    const pipBtn = document.getElementById('pip-btn');
    if (pipBtn) pipBtn.style.display = 'block';
  }
}
function runPipCleanups() {
  pipCleanups.forEach(cleanup => {
    try {
      cleanup();
    } catch (e) {
      console.error('PiP cleanup error:', e);
    }
  });
  pipCleanups = [];
}
async function togglePiP() {
  if (pipWindow) {
    pipWindow.close();
    return;
  }
  try {
    const timerSection = document.querySelector('.timer-section');
    if (!timerSection) return console.error('Timer section not found');
    console.log('PiP: Requesting window...');
    // Request a 20% smaller 1:1 square window (240x240)
    pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 240,
      height: 240
    });
    console.log('PiP: Copying styles...');
    copyStyles(pipWindow);

    // Defer injection to ensure PiP window document is fully ready
    requestAnimationFrame(() => {
      try {
        console.log('PiP: Injecting content...');
        timerParent = timerSection.parentNode;
        const nextSibling = timerSection.nextSibling;

        // Explicitly adopt the node into the PiP document
        const adoptedSection = pipWindow.document.adoptNode(timerSection);
        pipWindow.document.body.append(adoptedSection);
        pipWindow.document.body.classList.add('pip-body');

        // Move task label inside the circular timer
        const pipTaskEl = adoptedSection.querySelector('#current-task-display');
        const timerDisplay = adoptedSection.querySelector('.timer-display');
        const svgElement = adoptedSection.querySelector('.progress-ring');
        if (svgElement && !svgElement.getAttribute('viewBox')) {
          svgElement.setAttribute('viewBox', '0 0 250 250');
        }
        const originalTaskParent = pipTaskEl ? taskLabelInitialParent(pipTaskEl) : null;
        const originalTaskSibling = pipTaskEl ? pipTaskEl.nextSibling : null;

        // Move task label inside the circular timer
        if (pipTaskEl && timerDisplay) {
          timerDisplay.appendChild(pipTaskEl);
        }
        // Create the hover overlay using PiP document context
        const overlay = pipWindow.document.createElement('div');
        overlay.id = 'pip-overlay';
        overlay.className = 'pip-overlay hidden';
        const playSvg = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        const pauseSvg = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
        const skipSvg = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>`;
        overlay.innerHTML = `
                    <div class="pip-control-icon play-pause-btn">
                        ${state.isRunning ? pauseSvg : playSvg}
                        <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                    </div>
                    <div class="pip-control-icon skip-btn">
                        ${skipSvg}
                        <span class="pip-control-label">Skip</span>
                    </div>
                `;
        pipWindow.document.body.appendChild(overlay);
        const updateUI = () => {
          if (!pipWindow || pipWindow.closed) return;
          const currentMode = document.body.className.split(' ').find(c => c.startsWith('mode-')) || 'mode-pomodoro';
          pipWindow.document.body.className = `pip-body ${currentMode}`;
          if (timerDisplay) {
            if (state.isRunning) {
              timerDisplay.classList.add('is-running');
            } else {
              timerDisplay.classList.remove('is-running');
            }
          }
          const playPauseBtn = overlay.querySelector('.play-pause-btn');
          if (playPauseBtn) {
            const playSvg2 = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            const pauseSvg2 = `<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            playPauseBtn.innerHTML = `
                            ${state.isRunning ? pauseSvg2 : playSvg2}
                            <span class="pip-control-label">${state.isRunning ? 'Stop' : 'Resume'}</span>
                        `;
          }
          updateActiveTaskDisplay();
        };
        const observer = new MutationObserver(updateUI);
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class']
        });
        pipCleanups.push(() => observer.disconnect());
        const taskObserver = new MutationObserver(updateActiveTaskDisplay);
        const taskList = document.getElementById('task-list');
        if (taskList) {
          taskObserver.observe(taskList, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
          });
          pipCleanups.push(() => taskObserver.disconnect());
        }
        const targetDoc = pipWindow.document;
        const targetBody = pipWindow.document.body;
        const mouseEnterHandler = () => overlay.classList.remove('hidden');
        const mouseLeaveHandler = () => overlay.classList.add('hidden');
        targetBody.addEventListener('mouseenter', mouseEnterHandler);
        targetBody.addEventListener('mouseleave', mouseLeaveHandler);
        pipCleanups.push(() => {
          targetBody.removeEventListener('mouseenter', mouseEnterHandler);
          targetBody.removeEventListener('mouseleave', mouseLeaveHandler);
        });
        const playPauseBtn = overlay.querySelector('.play-pause-btn');
        const skipBtn = overlay.querySelector('.skip-btn');
        const playPauseClick = e => {
          e.stopPropagation();
          toggleTimer();
          updateUI();
        };
        playPauseBtn.addEventListener('click', playPauseClick);
        pipCleanups.push(() => {
          if (playPauseBtn) playPauseBtn.removeEventListener('click', playPauseClick);
        });
        const skipClick = e => {
          e.stopPropagation();
          skipPhase();
        };
        skipBtn.addEventListener('click', skipClick);
        pipCleanups.push(() => {
          if (skipBtn) skipBtn.removeEventListener('click', skipClick);
        });
        const showActionFeedback = action => {
          if (!pipWindow) return;
          const feedback = targetDoc.createElement('div');
          feedback.className = 'pip-action-feedback';
          let svg = '';
          let text = '';
          if (action === 'play') {
            svg = playSvg;
            text = 'Resume';
          } else if (action === 'pause') {
            svg = pauseSvg;
            text = 'Stop';
          } else if (action === 'skip') {
            svg = skipSvg;
            text = 'Skip';
          }
          feedback.innerHTML = `
                        <div class="icon">${svg}</div>
                        <div class="text">${text}</div>
                    `;
          targetBody.appendChild(feedback);
          requestAnimationFrame(() => {
            feedback.classList.add('show');
            setTimeout(() => {
              feedback.classList.remove('show');
              setTimeout(() => feedback.remove(), 300);
            }, 600);
          });
        };
        const keydownHandler = e => {
          if (e.code === 'Space') {
            e.preventDefault();
            toggleTimer();
            updateUI();
            showActionFeedback(state.isRunning ? 'play' : 'pause');
          } else if (e.key.toLowerCase() === 's') {
            skipPhase();
            updateUI();
            showActionFeedback('skip');
          } else if (e.key.toLowerCase() === 'p') {
            if (pipWindow) pipWindow.close();
          }
        };
        targetDoc.addEventListener('keydown', keydownHandler);
        pipCleanups.push(() => {
          targetDoc.removeEventListener('keydown', keydownHandler);
        });
        pipWindow.addEventListener('pagehide', () => {
          console.log('PiP: Closing and restoring...');
          runPipCleanups();
          pipWindow = null;
          if (pipTaskEl && originalTaskParent) {
            if (originalTaskSibling) {
              originalTaskParent.insertBefore(pipTaskEl, originalTaskSibling);
            } else {
              originalTaskParent.appendChild(pipTaskEl);
            }
          }
          if (timerParent && adoptedSection) {
            document.adoptNode(adoptedSection);
            if (nextSibling) timerParent.insertBefore(adoptedSection, nextSibling);else timerParent.appendChild(adoptedSection);
          }
        });
        updateUI();
        console.log('PiP: Success');
      } catch (innerErr) {
        console.error('PiP Injection Error:', innerErr);
      }
    });
  } catch (err) {
    console.error('PiP Launch Error:', err);
  }
}

// Helper to remember initial parent before move
function taskLabelInitialParent(el) {
  return el.parentNode;
}
function copyStyles(targetWindow) {
  const targetDoc = targetWindow.document;

  // Font Awesome
  const faLink = targetDoc.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  targetDoc.head.appendChild(faLink);

  // Main Styles
  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      if (styleSheet.cssRules) {
        const style = targetDoc.createElement('style');
        const rules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
        style.textContent = rules;
        targetDoc.head.appendChild(style);
      }
    } catch (e) {
      if (styleSheet.href) {
        const link = targetDoc.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleSheet.href;
        targetDoc.head.appendChild(link);
      }
    }
  });

  // Custom PiP Utility Overrides
  const pipStyle = targetDoc.createElement('style');
  pipStyle.textContent = `
        * { box-sizing: border-box !important; }
        
        body.pip-body {
            background-color: var(--clr-bg-pomodoro) !important;
            margin: 0 !important;
            padding: 0 !important;
            display: grid !important;
            place-items: center !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            font-family: 'Inter', sans-serif !important;
            color: white !important;
        }
        body.pip-body.mode-shortBreak { background-color: var(--clr-bg-short) !important; }
        body.pip-body.mode-longBreak { background-color: var(--clr-bg-long) !important; }
        
        .timer-section {
            width: 100% !important; 
            height: 100% !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: 1vmin !important;
            margin: 0 !important; 
            padding: 0 !important;
            background: transparent !important; 
            box-shadow: none !important; 
            border: none !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        .mode-selector, .status-text, .controls, .stats-section, .tasks-section, header { display: none !important; }
        
        .timer-display {
            position: relative !important; 
            width: 90vmin !important; 
            height: 90vmin !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: 2.5vmin !important;
            background: transparent !important;
            border: none !important;
            margin: 0 !important;
        }
        
        .timer-display.is-running .progress-ring__circle {
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)) !important;
        }
        
        .progress-ring {
            position: absolute !important; 
            top: 50% !important; 
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-90deg) !important; 
            width: 100% !important; 
            height: 100% !important;
            pointer-events: none !important;
        }
        
        .progress-ring__circle, .progress-ring__circle-bg {
            stroke-width: 12 !important;
        }
        
        .time { 
            font-size: min(18vmin, 4.5rem) !important; 
            font-weight: 700 !important; 
            line-height: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 10 !important;
            letter-spacing: -1.5px !important;
        }
        
        #current-task-display {
            font-size: min(4.5vmin, 0.85rem) !important; 
            max-width: 85% !important;
            margin: 0 !important;
            display: none !important;
        }
        #current-task-display.has-task {
            display: block !important;
        }

        .pip-overlay {
            position: fixed !important; 
            top: 0 !important; 
            left: 0 !important;
            width: 100% !important; 
            height: 100% !important;
            background: rgba(0,0,0,0.6) !important;
            display: flex !important; 
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: min(8vmin, 20px) !important;
            padding: 0 !important;
            z-index: 1000 !important;
            transition: opacity 0.2s ease !important;
            min-width: 0 !important;
        }
        .pip-overlay.hidden { opacity: 0 !important; pointer-events: none !important; }
        
        .pip-control-icon {
            display: flex !important; 
            flex-direction: column !important;
            align-items: center !important; 
            gap: min(3vmin, 8px) !important;
            cursor: pointer !important;
            pointer-events: auto !important;
            transition: transform 0.2s ease !important;
        }
        .pip-control-icon:hover {
            transform: scale(1.1) !important;
        }
        .pip-control-icon i { font-size: min(12vmin, 2.8rem) !important; color: white !important; }
        .pip-control-icon span { 
            font-weight: 600 !important; 
            text-transform: uppercase !important; 
            letter-spacing: 1.5px !important;
            font-size: min(3vmin, 0.65rem) !important;
        }

        /* Action Feedback Animation */
        .pip-action-feedback {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(0.8) !important;
            background: rgba(0, 0, 0, 0.65) !important;
            color: white !important;
            padding: min(4vmin, 15px) min(6vmin, 25px) !important;
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: min(2vmin, 8px) !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            z-index: 2000 !important;
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
        }
        .pip-action-feedback.show {
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
        }
        .pip-action-feedback .icon svg {
            width: min(10vmin, 40px) !important;
            height: min(10vmin, 40px) !important;
        }
        .pip-action-feedback .text {
            font-size: min(3.5vmin, 14px) !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }

        /* Responsive Layout for Short Windows or narrow windows */
        @media (max-height: 160px), (max-width: 200px) {
            .progress-ring {
                display: none !important;
            }
            .timer-display {
                width: 100vw !important;
                height: 100vh !important;
            }
            .time {
                font-size: min(40vh, 20vw, 4rem) !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #current-task-display {
                font-size: min(15vh, 8vw, 1.2rem) !important;
                margin: 0 !important;
            }
        }
    `;
  targetDoc.head.appendChild(pipStyle);
}
function updateActiveTaskDisplay() {
  let taskEl = null;
  if (pipWindow && !pipWindow.closed) {
    taskEl = pipWindow.document.getElementById('current-task-display');
  }
  if (!taskEl) {
    taskEl = document.getElementById('current-task-display');
  }
  if (taskEl) {
    const titleEl = document.querySelector('.task-item.active .task-title-text');
    if (titleEl && titleEl.textContent) {
      taskEl.textContent = titleEl.textContent;
      taskEl.classList.add('has-task');
    } else {
      const activeTask = document.querySelector('.task-item.active .task-text');
      if (activeTask && activeTask.firstChild) {
        taskEl.textContent = activeTask.firstChild.textContent || '';
        taskEl.classList.add('has-task');
      } else {
        taskEl.textContent = '';
        taskEl.classList.remove('has-task');
      }
    }
  }
}

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
  btn.addEventListener('click', e => {
    const target = e.target;
    if (!target.classList.contains('active')) {
      const mode = btn.dataset.mode;
      if (mode) {
        setMode(mode);
      }
    }
  });
});
elements.mainBtn.addEventListener('click', toggleTimer);
elements.skipBtn.addEventListener('click', skipPhase);

// ... Tasks Event Listeners ...
elements.form.addEventListener('submit', e => {
  e.preventDefault();
  const title = elements.taskInput.value.trim();
  const est = elements.estPomodorosInput.value;
  const catId = state.selectedCategoryFilter && state.selectedCategoryFilter !== 'all' ? state.selectedCategoryFilter : elements.taskCategorySelect ? elements.taskCategorySelect.value : '';
  if (title) {
    addTask(title, est, catId);
    elements.taskInput.value = '';
    elements.estPomodorosInput.value = '1';
    elements.taskInput.focus();
    updateActiveTaskDisplay();
  }
});
elements.taskList.addEventListener('click', async e => {
  const target = e.target;
  const categoryBtn = target.closest('[data-action="change-category"]');
  if (categoryBtn && categoryBtn.dataset.id) {
    showCategoryPicker(categoryBtn, categoryBtn.dataset.id);
    return;
  }
  const checkBtn = target.closest('[data-action="toggle"]');
  if (checkBtn && checkBtn.dataset.id) {
    toggleTaskComplete(checkBtn.dataset.id);
    updateActiveTaskDisplay();
    return;
  }
  const contentBtn = target.closest('[data-action="activate"]');
  if (contentBtn && contentBtn.dataset.id) {
    setActiveTask(contentBtn.dataset.id);
    updateActiveTaskDisplay();
    return;
  }
  const archiveBtn = target.closest('[data-action="archive"]');
  if (archiveBtn && archiveBtn.dataset.id) {
    archiveTask(archiveBtn.dataset.id);
    updateActiveTaskDisplay();
    return;
  }
  const restoreBtn = target.closest('[data-action="restore"]');
  if (restoreBtn && restoreBtn.dataset.id) {
    restoreTask(restoreBtn.dataset.id);
    updateActiveTaskDisplay();
    return;
  }
  const deletePermBtn = target.closest('[data-action="delete-permanent"]');
  if (deletePermBtn && deletePermBtn.dataset.id) {
    const confirmed = await customConfirm('Bạn có chắc muốn xóa vĩnh viễn task này không? Thao tác này không thể hoàn tác.');
    if (confirmed) {
      deletePermanently(deletePermBtn.dataset.id);
      updateActiveTaskDisplay();
    }
    return;
  }
  const deleteBtn = target.closest('[data-action="delete"]');
  if (deleteBtn && deleteBtn.dataset.id) {
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
elements.inputs.volume.addEventListener('input', e => {
  const target = e.target;
  elements.volumeDisplay.textContent = target.value;
});

// ... PiP Listener ...
elements.pipBtn.addEventListener('click', togglePiP);

// Inline Category Picker Popover
let activeCategoryPicker = null;
let popoverCleanup = null;
function closeCategoryPicker() {
  if (popoverCleanup) {
    popoverCleanup();
    popoverCleanup = null;
  }
  if (activeCategoryPicker) {
    activeCategoryPicker.remove();
    activeCategoryPicker = null;
  }
}
function showCategoryPicker(anchorEl, taskId) {
  closeCategoryPicker();
  const picker = document.createElement('div');
  picker.className = 'category-picker-popover';
  state.categories.forEach(cat => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'category-picker-item';
    const safeName = escapeHtml(cat.name);
    item.innerHTML = `<span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeName}</span>`;
    item.onclick = e => {
      e.stopPropagation();
      updateTaskCategory(taskId, cat.id);
      closeCategoryPicker();
    };
    picker.appendChild(item);
  });
  document.body.appendChild(picker);
  activeCategoryPicker = picker;
  const rect = anchorEl.getBoundingClientRect();
  const pickerHeight = picker.offsetHeight || 150;
  const top = rect.bottom + 6 + pickerHeight > window.innerHeight ? Math.max(10, rect.top - pickerHeight - 6) : rect.bottom + 6;
  const left = Math.min(Math.max(10, rect.left), window.innerWidth - 180);
  picker.style.top = `${top}px`;
  picker.style.left = `${left}px`;
  const startY = window.scrollY;
  const onScroll = () => {
    if (Math.abs(window.scrollY - startY) > 20) {
      closeCategoryPicker();
    }
  };
  const onResize = () => closeCategoryPicker();
  window.addEventListener('scroll', onScroll, {
    passive: true
  });
  window.addEventListener('resize', onResize, {
    passive: true
  });
  popoverCleanup = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}
document.addEventListener('click', e => {
  const target = e.target;
  if (target.closest('[data-action="change-category"]')) {
    return;
  }
  if (activeCategoryPicker && !activeCategoryPicker.contains(target)) {
    closeCategoryPicker();
  }
});

// Category Modal setup
let selectedCategoryColor = CATEGORY_COLORS[0];
function initCategoryModal() {
  if (!elements.categoryColorOptions) return;
  elements.categoryColorOptions.innerHTML = '';
  CATEGORY_COLORS.forEach((color, idx) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = `color-swatch ${idx === 0 ? 'selected' : ''}`;
    swatch.style.backgroundColor = color;
    swatch.setAttribute('aria-label', `Color ${color}`);
    swatch.onclick = () => {
      elements.categoryColorOptions.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedCategoryColor = color;
      updateCategoryModalPreview();
    };
    elements.categoryColorOptions.appendChild(swatch);
  });
  if (elements.categoryCloseBtn) {
    elements.categoryCloseBtn.onclick = () => {
      if (elements.categoryModal) elements.categoryModal.classList.add('hidden');
    };
  }
  if (elements.categoryCancelBtn) {
    elements.categoryCancelBtn.onclick = () => {
      if (elements.categoryModal) elements.categoryModal.classList.add('hidden');
    };
  }
  if (elements.categoryModal) {
    elements.categoryModal.addEventListener('click', e => {
      if (e.target === elements.categoryModal) elements.categoryModal.classList.add('hidden');
    });
  }
  if (elements.categoryNameInput) {
    elements.categoryNameInput.addEventListener('input', updateCategoryModalPreview);
  }
  if (elements.categorySaveBtn) {
    elements.categorySaveBtn.onclick = () => {
      const name = elements.categoryNameInput ? elements.categoryNameInput.value.trim() : '';
      if (name) {
        const newCat = addCategory(name, selectedCategoryColor);
        if (newCat) {
          if (elements.categoryModal) elements.categoryModal.classList.add('hidden');
          if (elements.categoryNameInput) elements.categoryNameInput.value = '';
          updateCategoryModalPreview();
        } else {
          alert('Category name already exists or is invalid.');
        }
      }
    };
  }
}
function updateCategoryModalPreview() {
  const previewBadge = document.getElementById('category-preview-badge');
  const previewText = document.getElementById('category-preview-text');
  const previewDot = previewBadge ? previewBadge.querySelector('.category-dot') : null;
  const name = elements.categoryNameInput ? elements.categoryNameInput.value.trim() : '';
  if (previewText) {
    previewText.textContent = name || 'New Category';
  }
  if (previewDot) {
    previewDot.style.backgroundColor = selectedCategoryColor;
  }
}

// Archive Modal setup
function initArchiveModal() {
  if (elements.openArchiveBtn) {
    elements.openArchiveBtn.addEventListener('click', () => {
      if (elements.archiveSearchInput) elements.archiveSearchInput.value = '';
      renderArchiveModal();
      if (elements.archiveModal) elements.archiveModal.classList.remove('hidden');
      if (elements.archiveSearchInput) elements.archiveSearchInput.focus();
    });
  }
  if (elements.closeArchiveBtn) {
    elements.closeArchiveBtn.addEventListener('click', () => {
      if (elements.archiveModal) elements.archiveModal.classList.add('hidden');
    });
  }
  if (elements.archiveModal) {
    elements.archiveModal.addEventListener('click', e => {
      if (e.target === elements.archiveModal) elements.archiveModal.classList.add('hidden');
    });
  }
  if (elements.archiveEmptyBtn) {
    elements.archiveEmptyBtn.addEventListener('click', async () => {
      const count = state.tasks ? state.tasks.filter(t => t.isArchived).length : 0;
      if (count === 0) return;
      const confirmed = await customConfirm(`Toàn bộ ${count} công việc đã lưu trữ sẽ bị xóa vĩnh viễn khỏi thiết bị và không thể khôi phục lại.`, {
        title: `Dọn sạch ${count} công việc?`,
        confirmText: 'Xóa tất cả',
        cancelText: 'Hủy bỏ',
        isDanger: true
      });
      if (confirmed) {
        emptyArchivedTasks();
        updateActiveTaskDisplay();
      }
    });
  }
  if (elements.archiveSearchInput) {
    elements.archiveSearchInput.addEventListener('input', () => {
      renderArchiveModal(elements.archiveSearchInput.value);
    });
  }
  if (elements.archiveTaskList) {
    elements.archiveTaskList.addEventListener('click', async e => {
      const target = e.target;
      const restoreBtn = target.closest('[data-action="restore"]');
      if (restoreBtn && restoreBtn.dataset.id) {
        restoreTask(restoreBtn.dataset.id);
        updateActiveTaskDisplay();
        return;
      }
      const deletePermBtn = target.closest('[data-action="delete-permanent"]');
      if (deletePermBtn && deletePermBtn.dataset.id) {
        const confirmed = await customConfirm('Công việc này sẽ bị xóa hoàn toàn khỏi kho lưu trữ và không thể khôi phục lại.', {
          title: 'Xóa vĩnh viễn công việc?',
          confirmText: 'Xóa ngay',
          cancelText: 'Hủy bỏ',
          isDanger: true
        });
        if (confirmed) {
          deletePermanently(deletePermBtn.dataset.id);
          updateActiveTaskDisplay();
        }
        return;
      }
    });
  }
}

// Global modal esc/click-outside handler
document.addEventListener('keydown', e => {
  // Check if user is typing in an input or textarea
  const typing = isUserTyping(e);
  const isSettingsOpen = !elements.settingsModal.classList.contains('hidden');
  const isAuthOpen = !elements.authModal.classList.contains('hidden');
  const isCategoryOpen = elements.categoryModal && !elements.categoryModal.classList.contains('hidden');
  const isArchiveOpen = elements.archiveModal && !elements.archiveModal.classList.contains('hidden');
  const confirmModalEl = document.getElementById('confirm-modal');
  const isConfirmOpen = confirmModalEl && !confirmModalEl.classList.contains('hidden');
  if (isSettingsOpen) {
    trapFocus(e, elements.settingsModal);
  } else if (isAuthOpen) {
    trapFocus(e, elements.authModal);
  } else if (isCategoryOpen) {
    trapFocus(e, elements.categoryModal);
  } else if (isArchiveOpen) {
    trapFocus(e, elements.archiveModal);
  }
  if (e.key === 'Escape') {
    if (isConfirmOpen) return;
    if (isSettingsOpen) toggleSettingsModal(false);
    if (isAuthOpen) toggleAuthModal(false);
    if (isCategoryOpen) elements.categoryModal.classList.add('hidden');
    if (isArchiveOpen) elements.archiveModal.classList.add('hidden');
  }

  // Keyboard Shortcuts (only if not typing and no modifier keys and no modal open)
  if (!typing && !e.ctrlKey && !e.altKey && !e.metaKey && !isSettingsOpen && !isAuthOpen && !isCategoryOpen && !isArchiveOpen && !isConfirmOpen) {
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
    if (e.key.toLowerCase() === 'c') {
      e.preventDefault();
      toggleSettingsModal(true);
    }
  }
});
elements.settingsModal.addEventListener('click', e => {
  if (e.target === elements.settingsModal) toggleSettingsModal(false);
});
elements.authModal.addEventListener('click', e => {
  if (e.target === elements.authModal) toggleAuthModal(false);
});

// --- Initialization ---
function init() {
  loadSettings();
  applyTheme();
  updateVolume();
  loadCategories();
  initCategoryModal();
  initArchiveModal();
  loadTasks();
  updateActiveTaskDisplay();
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
