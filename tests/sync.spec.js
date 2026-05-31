// h:\Apps\_Project\_Personal\Pomodoro\tests\sync.spec.js

// Using Vitest/Jest style since there are existing tests (features.spec.js)
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncDataToCloud, loadDataFromCloud } from '../src/js/modules/sync.js';
import { state, resetState } from '../src/js/modules/state.js';
import { db } from '../src/js/modules/firebase.js';
import { setDoc, getDoc } from 'firebase/firestore';

// Mock firebase
vi.mock('firebase/firestore', () => ({
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    doc: vi.fn()
}));

vi.mock('../src/js/modules/firebase.js', () => ({
    db: {}
}));

describe('Sync Module', () => {
    beforeEach(() => {
        resetState();
        vi.clearAllMocks();
        // Mock global functions called by sync
        global.toggleSyncIndicator = vi.fn();
        global.saveSettings = vi.fn();
        global.saveTasks = vi.fn();
        global.renderTasks = vi.fn();
    });

    it('should sync local data to cloud', async () => {
        state.settings = { pomodoro: 30 };
        state.tasks = [{ id: '1', title: 'Task 1' }];
        state.focusHistory = { '2023-10-01': { seconds: 1500, pomodoros: 1 } };

        const mockUser = { uid: 'user123' };
        await syncDataToCloud(mockUser);

        expect(setDoc).toHaveBeenCalled();
        const payload = setDoc.mock.calls[0][1];
        
        expect(payload.settings).toEqual(state.settings);
        expect(payload.tasks).toEqual(state.tasks);
        expect(payload.focusHistory).toEqual(state.focusHistory);
        expect(payload.updatedAt).toBeDefined();
    });

    it('should load data from cloud and merge tasks', async () => {
        // Setup initial local tasks
        state.tasks = [{ id: 'local1', title: 'Local Task' }];

        // Setup mock cloud response
        const mockCloudData = {
            settings: { pomodoro: 40 },
            tasks: [{ id: 'cloud1', title: 'Cloud Task' }],
            focusHistory: { '2023-10-02': { seconds: 100, pomodoros: 0 } }
        };

        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => mockCloudData
        });

        const mockUser = { uid: 'user123' };
        await loadDataFromCloud(mockUser);

        // Verify settings updated
        expect(state.settings.pomodoro).toBe(40);
        
        // Verify history updated
        expect(state.focusHistory['2023-10-02']).toBeDefined();

        // Verify tasks merged (should have both cloud1 and local1)
        expect(state.tasks.length).toBe(2);
        expect(state.tasks.map(t => t.id)).toContain('cloud1');
        expect(state.tasks.map(t => t.id)).toContain('local1');
    });
});
