import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetLocalState } from '../../src/js/modules/state';

describe('state module', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('resets pomodorosCompleted and localStorage keys on resetLocalState', () => {
        state.pomodorosCompleted = 4;
        state.activeTaskId = 'task-1';
        localStorage.setItem('pomodoro_tasks', '[]');
        localStorage.setItem('pomodoro_categories', '[]');
        localStorage.setItem('pomodoro_settings', '{}');

        resetLocalState();

        expect(state.pomodorosCompleted).toBe(0);
        expect(state.activeTaskId).toBeNull();
        expect(state.tasks).toEqual([]);
        expect(localStorage.getItem('pomodoro_tasks')).toBeNull();
        expect(localStorage.getItem('pomodoro_categories')).toBeNull();
        expect(localStorage.getItem('pomodoro_settings')).toBeNull();
    });
});
