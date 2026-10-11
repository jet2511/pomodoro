import { state, notifyStateChange } from './state';
import { elements } from './elements';
import { Task } from '../types/index';
import { getCategoryById, categoryEvents } from './categories';

export const taskEvents = {
    onTaskActivated: () => { }
};

categoryEvents.onCategoryChanged = () => {
    renderTasks();
};

export function getFirstIncompleteTask(): Task | null {
    return state.tasks.find(t => !t.isCompleted && !t.isArchived) || null;
}

export function loadTasks(): void {
    const saved = localStorage.getItem('pomodoro_tasks');
    if (saved) {
        try {
            state.tasks = JSON.parse(saved);
        } catch (e) {
            state.tasks = [];
        }
        const active = state.tasks.find(t => t.isActive && !t.isArchived);
        if (active) state.activeTaskId = active.id;
        else state.activeTaskId = null;
        renderTasks();
    }
    updateArchiveBadgeCount();
}

export function saveTasks(): void {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(state.tasks));
}

export function addTask(title: string, estPomodoros: string | number, categoryId?: string): void {
    title = title.substring(0, 200);
    const isFirstTask = state.tasks.length === 0;
    const taskId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
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

    const newTask: Task = {
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

export function toggleTaskComplete(id: string): void {
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

export function setActiveTask(id: string): void {
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

export function deleteTask(id: string): void {
    // Instead of deleting, archive the task
    archiveTask(id);
}

export function archiveTask(id: string): void {
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

export function restoreTask(id: string): void {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.isArchived = false;
        saveTasks();
        renderTasks();
        renderArchiveModal(elements.archiveSearchInput ? elements.archiveSearchInput.value : '');
        notifyStateChange();
    }
}

export function deletePermanently(id: string): void {
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.activeTaskId === id) {
        state.activeTaskId = null;
    }
    saveTasks();
    renderTasks();
    renderArchiveModal(elements.archiveSearchInput ? elements.archiveSearchInput.value : '');
    notifyStateChange();
}

export function emptyArchivedTasks(): void {
    state.tasks = state.tasks.filter(t => !t.isArchived);
    saveTasks();
    renderTasks();
    renderArchiveModal();
    notifyStateChange();
}

export function updateArchiveBadgeCount(): void {
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

export function renderArchiveModal(searchQuery: string = ''): void {
    updateArchiveBadgeCount();
    if (!elements.archiveTaskList) return;

    const archivedTasks = (state.tasks || []).filter(t => t.isArchived);
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
        ? archivedTasks.filter(t => t.title.toLowerCase().includes(query))
        : archivedTasks;

    if (filtered.length === 0) {
        const emptyMsg = query
            ? 'Không tìm thấy công việc phù hợp.'
            : 'Chưa có công việc nào được lưu trữ.';
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

        const tempDiv = document.createElement('div');
        tempDiv.textContent = task.title;
        const sanitizedTitle = tempDiv.innerHTML;
        const cat = getCategoryById(task.categoryId);

        item.innerHTML = `
            <div class="archive-task-check">
                <svg viewBox="0 0 448 512" width="12" height="12" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
            </div>
            <div class="archive-task-info">
                <div class="archive-task-title">
                    <span class="task-title-text">${sanitizedTitle}</span>
                    <span class="task-category-badge-static">
                        <span class="category-dot" style="background-color: ${cat.color}"></span>
                        <span>${cat.name}</span>
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

export function updateTaskCategory(taskId: string, categoryId: string): void {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.categoryId !== categoryId) {
        task.categoryId = categoryId;
        saveTasks();
        renderTasks();
        notifyStateChange();
    }
}

export function updateTaskPomodoros(): void {
    if (!state.activeTaskId) return;

    const task = state.tasks.find(t => t.id === state.activeTaskId);
    if (task) {
        task.actualPomodoros++;
        saveTasks();
        renderTasks();
        notifyStateChange();
    }
}

export function renderTasks(): void {
    if (elements.form) {
        elements.form.style.display = 'flex';
    }

    const activeTasks = state.tasks.filter(t => !t.isArchived);
    const filteredTasks = state.selectedCategoryFilter === 'all'
        ? activeTasks
        : activeTasks.filter(t => (t.categoryId || 'cat_general') === state.selectedCategoryFilter);

    updateArchiveBadgeCount();

    if (filteredTasks.length === 0) {
        const msg = activeTasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks in this category.';
        elements.taskList.innerHTML = `<div style="text-align: center; color: var(--clr-text-muted); font-size: 0.9rem; padding: 1.5rem 0;">${msg}</div>`;
        return;
    }

    const emptyMsg = elements.taskList.querySelector('div[style]');
    if (emptyMsg) emptyMsg.remove();

    const existingElements = Array.from(elements.taskList.children);
    const existingMap = new Map<string, Element>();
    existingElements.forEach(el => {
        const checkBtn = el.querySelector('[data-action="toggle"]') as HTMLElement | null;
        if (checkBtn && checkBtn.dataset.id) {
            existingMap.set(checkBtn.dataset.id, el);
        } else {
            el.remove();
        }
    });

    let currentSibling: Element | null = null;

    filteredTasks.forEach(task => {
        let item = existingMap.get(task.id) as HTMLElement | undefined;
        const tempDiv = document.createElement('div');
        tempDiv.textContent = task.title;
        const sanitizedTitle = tempDiv.innerHTML;
        const cat = getCategoryById(task.categoryId);
        const categoryBadgeHtml = `<button type="button" class="task-category-badge" data-action="change-category" data-id="${task.id}" title="Click to change category" aria-label="Category: ${cat.name}"><span class="category-dot" style="background-color: ${cat.color}"></span><span>${cat.name}</span><svg class="category-chevron" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 9l6 6 6-6"/></svg></button>`;
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
            item.addEventListener('dragstart', (e: DragEvent) => {
                if (item) item.classList.add('dragging');
                if (e && e.dataTransfer) {
                    try { e.dataTransfer.setData('text/plain', task.id); } catch (_) {}
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
            item.addEventListener('dragend', () => {
                if (item) {
                    item.classList.remove('dragging');
                    document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
                }
            });
            item.addEventListener('dragover', (e: DragEvent) => {
                e.preventDefault();
                if (item) {
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                    item.classList.add('drag-over');
                }
            });
            item.addEventListener('dragleave', () => {
                if (item) item.classList.remove('drag-over');
            });
            item.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();
                let draggedId = '';
                if (e.dataTransfer) {
                    try { draggedId = e.dataTransfer.getData('text/plain'); } catch (_) {}
                }
                if (!draggedId) {
                    const draggingEl = document.querySelector('.task-item.dragging') as HTMLElement;
                    if (draggingEl) draggedId = draggingEl.getAttribute('data-task-id') || '';
                }
                if (draggedId && draggedId !== task.id) reorderTasks(draggedId, task.id);
            });
        } else {
            item.className = `task-item ${task.isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}`;
            const textEl = item.querySelector('.task-text') as HTMLElement;
            if (textEl && textEl.innerHTML !== titleWithBadge) textEl.innerHTML = titleWithBadge;
            const statsEl = item.querySelector('.task-stats') as HTMLElement;
            if (statsEl && statsEl.textContent !== statsText) statsEl.textContent = statsText;
            const actionsEl = item.querySelector('.task-actions') as HTMLElement;
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

function reorderTasks(draggedId: string, targetId: string): void {
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
