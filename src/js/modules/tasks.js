import { state } from './state.js';
import { elements } from './elements.js';

export const taskEvents = {
    onTaskActivated: () => { }
};

export function loadTasks() {
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

export function saveTasks() {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(state.tasks));
}

export function addTask(title, estPomodoros) {
    const isFirstTask = state.tasks.length === 0;
    const newTask = {
        id: Date.now().toString(),
        title,
        estPomodoros: parseInt(estPomodoros),
        actualPomodoros: 0,
        isCompleted: false,
        isActive: isFirstTask
    };
    if (isFirstTask) state.activeTaskId = newTask.id;
    state.tasks.push(newTask);
    saveTasks();
    renderTasks();
}

export function toggleTaskComplete(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.isCompleted = !task.isCompleted;
        if (task.isCompleted && task.isActive) {
            task.isActive = false;
            state.activeTaskId = null;
        }
        saveTasks();
        renderTasks();
    }
}

export function setActiveTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task && !task.isCompleted) {
        state.tasks.forEach(t => t.isActive = false);
        task.isActive = true;
        state.activeTaskId = id;
        saveTasks();
        renderTasks();

        taskEvents.onTaskActivated();
    }
}

export function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.activeTaskId === id) {
        state.activeTaskId = null;
    }
    saveTasks();
    renderTasks();
}

export function updateTaskPomodoros() {
    if (!state.activeTaskId) return;

    const task = state.tasks.find(t => t.id === state.activeTaskId);
    if (task) {
        task.actualPomodoros++;
        saveTasks();
        renderTasks();
    }
}

export function renderTasks() {
    elements.taskList.innerHTML = '';
    if (state.tasks.length === 0) {
        elements.taskList.innerHTML = `<div style="text-align: center; color: var(--clr-text-muted); font-size: 0.9rem; padding: 1rem 0;">No tasks yet. Add one above!</div>`;
        return;
    }
    state.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}`;

        item.innerHTML = `
            <div class="task-check" data-action="toggle" data-id="${task.id}" title="Toggle completion">
                <i class="fa-solid fa-check"></i>
            </div>
            <div class="task-content" data-action="activate" data-id="${task.id}" draggable="true">
                <div class="task-text">${task.title}</div>
                <div class="task-stats">${task.actualPomodoros} / ${task.estPomodoros} ${task.actualPomodoros === 1 && task.estPomodoros === 1 ? 'pomodoro' : 'pomodoros'}</div>
            </div>
            <div class="task-actions">
                <button class="action-btn delete-btn" data-action="delete" data-id="${task.id}" title="Delete Task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        // DRAG & DROP LOGIC
        const content = item.querySelector('.task-content');

        content.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        content.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId !== task.id) {
                reorderTasks(draggedId, task.id);
            }
        });

        elements.taskList.appendChild(item);
    });
}

function reorderTasks(draggedId, targetId) {
    const draggedIndex = state.tasks.findIndex(t => t.id === draggedId);
    const targetIndex = state.tasks.findIndex(t => t.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedTask] = state.tasks.splice(draggedIndex, 1);
        state.tasks.splice(targetIndex, 0, draggedTask);
        saveTasks();
        renderTasks();
    }
}
