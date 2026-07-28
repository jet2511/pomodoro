import { state, notifyStateChange } from './state';
import { elements } from './elements';
import { Task } from '../types/index';

export const taskEvents = {
    onTaskActivated: () => { }
};

export function getFirstIncompleteTask(): Task | null {
    return state.tasks.find(t => !t.isCompleted) || null;
}

export function loadTasks(): void {
    const saved = localStorage.getItem('pomodoro_tasks');
    if (saved) {
        try {
            state.tasks = JSON.parse(saved);
        } catch (e) {
            state.tasks = [];
        }
        const active = state.tasks.find(t => t.isActive);
        if (active) state.activeTaskId = active.id;
        renderTasks();
    }
}

export function saveTasks(): void {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(state.tasks));
}

export function addTask(title: string, estPomodoros: string | number): void {
    title = title.substring(0, 200);
    const isFirstTask = state.tasks.length === 0;
    const taskId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    const est = typeof estPomodoros === 'string' ? parseInt(estPomodoros) : estPomodoros;
    const newTask: Task = {
        id: taskId,
        title,
        estPomodoros: Math.min(100, Math.max(1, est || 1)),
        actualPomodoros: 0,
        isCompleted: false,
        isActive: isFirstTask
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
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.activeTaskId === id) {
        state.activeTaskId = null;
    }
    saveTasks();
    renderTasks();
    notifyStateChange();
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
    if (state.tasks.length === 0) {
        elements.taskList.innerHTML = `<div style="text-align: center; color: var(--clr-text-muted); font-size: 0.9rem; padding: 1rem 0;">No tasks yet. Add one above!</div>`;
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

    state.tasks.forEach(task => {
        let item = existingMap.get(task.id) as HTMLElement | undefined;
        const tempDiv = document.createElement('div');
        tempDiv.textContent = task.title;
        const sanitizedTitle = tempDiv.innerHTML;
        const statsText = `${task.actualPomodoros} / ${task.estPomodoros} ${task.actualPomodoros === 1 && task.estPomodoros === 1 ? 'pomodoro' : 'pomodoros'}`;

        if (!item) {
            item = document.createElement('div');
            item.className = `task-item ${task.isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="task-check" data-action="toggle" data-id="${task.id}" title="Toggle completion">
                    <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                </div>
                <div class="task-content" data-action="activate" data-id="${task.id}" draggable="true">
                    <div class="task-text">${sanitizedTitle}</div>
                    <div class="task-stats">${statsText}</div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete-btn" data-action="delete" data-id="${task.id}" title="Delete Task">
                        <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </button>
                </div>
            `;
            const content = item.querySelector('.task-content') as HTMLElement;
            content.addEventListener('dragstart', (e: DragEvent) => {
                if (item && e.dataTransfer) {
                    item.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
            content.addEventListener('dragend', () => {
                if (item) {
                    item.classList.remove('dragging');
                    document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
                }
            });
            item.addEventListener('dragover', (e: DragEvent) => {
                e.preventDefault();
                if (e.dataTransfer && item) {
                    e.dataTransfer.dropEffect = 'move';
                    item.classList.add('drag-over');
                }
            });
            item.addEventListener('dragleave', () => {
                if (item) item.classList.remove('drag-over');
            });
            item.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();
                if (e.dataTransfer) {
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId !== task.id) reorderTasks(draggedId, task.id);
                }
            });
        } else {
            item.className = `task-item ${task.isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}`;
            const textEl = item.querySelector('.task-text') as HTMLElement;
            if (textEl.innerHTML !== sanitizedTitle) textEl.innerHTML = sanitizedTitle;
            const statsEl = item.querySelector('.task-stats') as HTMLElement;
            if (statsEl.textContent !== statsText) statsEl.textContent = statsText;
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
