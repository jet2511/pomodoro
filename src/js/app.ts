import { elements } from './modules/elements';
import { loadSettings, stateEvents } from './modules/state';
import { setMode, toggleTimer, skipPhase, timerEvents } from './modules/timer';
import { loadTasks, addTask, toggleTaskComplete, setActiveTask, archiveTask, restoreTask, deletePermanently, emptyArchivedTasks, renderArchiveModal, updateTaskPomodoros, updateTaskCategory, taskEvents, getFirstIncompleteTask } from './modules/tasks';
import { toggleSettingsModal, saveSettings, applyTheme } from './modules/settings';
import { updateVolume, previewAlarm } from './modules/audio';
import { initAuth, toggleAuthModal, getCurrentUser } from './modules/auth';
import { syncDataToCloud, markLocalChangesPending } from './modules/sync';
import { updateStatsUI } from './modules/stats';
import { initPiP, togglePiP, updateActiveTaskDisplay } from './modules/pip';
import { isUserTyping, debounce, trapFocus, customConfirm, escapeHtml, sanitizeHexColor } from './modules/utils';
import { loadCategories, addCategory, CATEGORY_COLORS } from './modules/categories';
import { state } from './modules/state';
import { refreshIcons } from './modules/icons';

// Setup Event Bridges
timerEvents.onPomodoroComplete = () => {
    updateTaskPomodoros();
    updateStatsUI();
};

timerEvents.onPomodoroStart = async () => {
    const task = getFirstIncompleteTask();
    
    if (task) {
        const wantsToSelect = await customConfirm(`No task selected. Start working on "${task.title}"?`);
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
    btn.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('active')) {
            const mode = btn.dataset.mode as 'pomodoro' | 'shortBreak' | 'longBreak';
            if (mode) {
                setMode(mode);
            }
        }
    });
});

elements.mainBtn.addEventListener('click', toggleTimer);
elements.skipBtn.addEventListener('click', skipPhase);

// ... Tasks Event Listeners ...
elements.form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const title = elements.taskInput.value.trim();
    const est = elements.estPomodorosInput.value;
    const catId = (state.selectedCategoryFilter && state.selectedCategoryFilter !== 'all')
        ? state.selectedCategoryFilter
        : (elements.taskCategorySelect ? elements.taskCategorySelect.value : '');
    if (title) {
        addTask(title, est, catId);
        elements.taskInput.value = '';
        elements.estPomodorosInput.value = '1';
        elements.taskInput.focus();
        updateActiveTaskDisplay();
    }
});

elements.taskList.addEventListener('click', async (e: Event) => {
    const target = e.target as HTMLElement;
    const categoryBtn = target.closest('[data-action="change-category"]') as HTMLElement | null;
    if (categoryBtn && categoryBtn.dataset.id) {
        showCategoryPicker(categoryBtn, categoryBtn.dataset.id);
        return;
    }

    const checkBtn = target.closest('[data-action="toggle"]') as HTMLElement | null;
    if (checkBtn && checkBtn.dataset.id) {
        toggleTaskComplete(checkBtn.dataset.id);
        updateActiveTaskDisplay();
        return;
    }

    const contentBtn = target.closest('[data-action="activate"]') as HTMLElement | null;
    if (contentBtn && contentBtn.dataset.id) {
        setActiveTask(contentBtn.dataset.id);
        updateActiveTaskDisplay();
        return;
    }

    const archiveBtn = target.closest('[data-action="archive"]') as HTMLElement | null;
    if (archiveBtn && archiveBtn.dataset.id) {
        archiveTask(archiveBtn.dataset.id);
        updateActiveTaskDisplay();
        return;
    }
});

// ... Settings Event Listeners ...
elements.settingsBtn.addEventListener('click', () => toggleSettingsModal(true));
elements.closeSettingsBtn.addEventListener('click', () => toggleSettingsModal(false));
document.getElementById('cancel-settings-btn')?.addEventListener('click', () => toggleSettingsModal(false));
document.getElementById('test-alarm-btn')?.addEventListener('click', () => {
    const sound = elements.inputs.alarmSound.value as 'bell' | 'bird' | 'digital';
    const parsedVol = parseInt(elements.inputs.volume.value, 10);
    const volume = Number.isNaN(parsedVol) ? 50 : parsedVol;
    previewAlarm(sound, volume);
});
elements.saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    toggleSettingsModal(false);
});

elements.inputs.volume.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    elements.volumeDisplay.textContent = target.value;
    target.style.setProperty('--volume-pct', `${target.value}%`);
});

elements.inputs.darkMode.addEventListener('change', () => {
    applyTheme(elements.inputs.darkMode.checked);
});

// ... PiP Listener ...
elements.pipBtn.addEventListener('click', togglePiP);

// Inline Category Picker Popover
let activeCategoryPicker: HTMLElement | null = null;
let popoverCleanup: (() => void) | null = null;

function closeCategoryPicker(): void {
    if (popoverCleanup) {
        popoverCleanup();
        popoverCleanup = null;
    }
    if (activeCategoryPicker) {
        activeCategoryPicker.remove();
        activeCategoryPicker = null;
    }
}

function showCategoryPicker(anchorEl: HTMLElement, taskId: string): void {
    closeCategoryPicker();

    const picker = document.createElement('div');
    picker.className = 'category-picker-popover';

    state.categories.filter(c => !c.deletedAt).forEach(cat => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'category-picker-item';
        const safeName = escapeHtml(cat.name);
        const safeColor = sanitizeHexColor(cat.color);
        item.innerHTML = `<span class="category-dot" style="background-color: ${safeColor}"></span><span>${safeName}</span>`;
        item.onclick = (e: MouseEvent) => {
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
    const top = (rect.bottom + 6 + pickerHeight > window.innerHeight)
        ? Math.max(10, rect.top - pickerHeight - 6)
        : rect.bottom + 6;
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

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    popoverCleanup = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
    };
}

document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-action="change-category"]')) {
        return;
    }
    if (activeCategoryPicker && !activeCategoryPicker.contains(target)) {
        closeCategoryPicker();
    }
});

// Category Modal setup
let selectedCategoryColor = CATEGORY_COLORS[0];

function closeCategoryModal(): void {
    if (elements.categoryModal) elements.categoryModal.classList.add('hidden');
    const errEl = document.getElementById('category-error-msg');
    if (errEl) errEl.style.display = 'none';
}

function initCategoryModal(): void {
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
        elements.categoryCloseBtn.onclick = closeCategoryModal;
    }

    if (elements.categoryCancelBtn) {
        elements.categoryCancelBtn.onclick = closeCategoryModal;
    }

    if (elements.categoryModal) {
        elements.categoryModal.addEventListener('click', (e: Event) => {
            if (e.target === elements.categoryModal) closeCategoryModal();
        });
    }

    if (elements.categoryNameInput) {
        elements.categoryNameInput.addEventListener('input', () => {
            updateCategoryModalPreview();
            const errEl = document.getElementById('category-error-msg');
            if (errEl) errEl.style.display = 'none';
        });
    }

    if (elements.categorySaveBtn) {
        elements.categorySaveBtn.onclick = () => {
            const name = elements.categoryNameInput ? elements.categoryNameInput.value.trim() : '';
            const errEl = document.getElementById('category-error-msg');
            if (!name) {
                if (errEl) {
                    errEl.textContent = 'Please enter a category name.';
                    errEl.style.display = 'block';
                }
                return;
            }
            const newCat = addCategory(name, selectedCategoryColor);
            if (newCat) {
                closeCategoryModal();
                if (elements.categoryNameInput) elements.categoryNameInput.value = '';
                updateCategoryModalPreview();
            } else if (errEl) {
                errEl.textContent = 'Category name already exists or is invalid.';
                errEl.style.display = 'block';
            }
        };
    }
}

function updateCategoryModalPreview(): void {
    const previewBadge = document.getElementById('category-preview-badge');
    const previewText = document.getElementById('category-preview-text');
    const previewDot = previewBadge ? previewBadge.querySelector('.category-dot') as HTMLElement : null;
    const name = elements.categoryNameInput ? elements.categoryNameInput.value.trim() : '';
    if (previewText) {
        previewText.textContent = name || 'New Category';
    }
    if (previewDot) {
        previewDot.style.backgroundColor = selectedCategoryColor;
    }
}

// Archive Modal setup
function initArchiveModal(): void {
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
        elements.archiveModal.addEventListener('click', (e: Event) => {
            if (e.target === elements.archiveModal) elements.archiveModal.classList.add('hidden');
        });
    }

    if (elements.archiveEmptyBtn) {
        elements.archiveEmptyBtn.addEventListener('click', async () => {
            const count = state.tasks ? state.tasks.filter(t => t.isArchived && !t.deletedAt).length : 0;
            if (count === 0) return;
            const confirmed = await customConfirm(
                `All ${count} archived ${count === 1 ? 'task' : 'tasks'} will be permanently deleted and cannot be recovered.`,
                {
                    title: `Clear ${count} archived ${count === 1 ? 'task' : 'tasks'}?`,
                    confirmText: 'Delete All',
                    cancelText: 'Cancel',
                    isDanger: true
                }
            );
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
        elements.archiveTaskList.addEventListener('click', async (e: Event) => {
            const target = e.target as HTMLElement;
            const restoreBtn = target.closest('[data-action="restore"]') as HTMLElement | null;
            if (restoreBtn && restoreBtn.dataset.id) {
                restoreTask(restoreBtn.dataset.id);
                updateActiveTaskDisplay();
                return;
            }

            const deletePermBtn = target.closest('[data-action="delete-permanent"]') as HTMLElement | null;
            if (deletePermBtn && deletePermBtn.dataset.id) {
                const confirmed = await customConfirm(
                    'This task will be permanently deleted from the archive and cannot be recovered.',
                    {
                        title: 'Delete task permanently?',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                        isDanger: true
                    }
                );
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
document.addEventListener('keydown', (e: KeyboardEvent) => {
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
        if (isCategoryOpen) closeCategoryModal();
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

elements.settingsModal.addEventListener('click', (e: Event) => {
    if (e.target === elements.settingsModal) toggleSettingsModal(false);
});
elements.authModal.addEventListener('click', (e: Event) => {
    if (e.target === elements.authModal) toggleAuthModal(false);
});

// --- Initialization ---
function init(): void {
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
    refreshIcons();

    // Centralized Syncing
    const debouncedSync = debounce(() => {
        const user = getCurrentUser();
        if (user) syncDataToCloud(user);
    }, 2000);

    stateEvents.onStateChange = () => {
        markLocalChangesPending();
        debouncedSync();
    };

    // Initialize Firebase Auth
    initAuth();
}

// Start
init();
