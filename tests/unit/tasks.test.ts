import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../src/js/modules/elements', () => ({
    elements: {
        form: null,
        taskList: {
            innerHTML: '',
            querySelector: () => null,
            children: [],
            prepend: vi.fn(),
        },
        taskCategorySelect: null,
        archiveCountBadge: null,
        archiveModalCount: null,
        archiveTaskList: null,
        archiveSearchInput: null,
        categoryFiltersContainer: null,
    },
}));

import { addTask, archiveTask, restoreTask, deletePermanently } from '../../src/js/modules/tasks';
import { state, resetLocalState } from '../../src/js/modules/state';
import { sanitizeHexColor } from '../../src/js/modules/utils';

describe('tasks & utils', () => {
    beforeEach(() => {
        localStorage.clear();
        resetLocalState();
    });

    it('marks new task active when all existing tasks are archived', () => {
        addTask('First', 1);
        const firstId = state.tasks[0].id;
        archiveTask(firstId);
        expect(state.tasks[0].isActive).toBe(false);
        expect(state.activeTaskId).toBeNull();

        addTask('Second', 1);
        const second = state.tasks.find(t => t.title === 'Second')!;
        expect(second.isActive).toBe(true);
        expect(state.activeTaskId).toBe(second.id);
    });

    it('restores archived task without stealing active state', () => {
        addTask('Task A', 1);
        const idA = state.tasks[0].id;
        archiveTask(idA);
        restoreTask(idA);
        expect(state.tasks[0].isArchived).toBe(false);
        expect(state.tasks[0].isActive).toBe(false);
    });

    it('soft-deletes task with deletedAt tombstone', () => {
        addTask('Task B', 1);
        const idB = state.tasks[0].id;
        deletePermanently(idB);
        expect(state.tasks[0].deletedAt).toBeTypeOf('number');
        expect(state.activeTaskId).toBeNull();
    });

    it('sanitizes hex colors', () => {
        expect(sanitizeHexColor('#4F46E5')).toBe('#4F46E5');
        expect(sanitizeHexColor('red; background: url(x)')).toBe('#6B7280');
        expect(sanitizeHexColor('"><script>')).toBe('#6B7280');
    });
});
