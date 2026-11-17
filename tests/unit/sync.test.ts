import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mergeByUpdatedAt, syncDataToCloud } from '../../src/js/modules/sync';
import { state, resetLocalState } from '../../src/js/modules/state';
import { setDoc } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
    setDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn(() => 'mock-doc-ref'),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    onSnapshot: vi.fn(),
}));

vi.mock('../../src/js/modules/firebase', () => ({
    getDbRef: vi.fn(() => ({})),
    initFirestore: vi.fn().mockResolvedValue({}),
}));

describe('sync module', () => {
    beforeEach(() => {
        resetLocalState();
        vi.clearAllMocks();
    });

    it('merges items by updatedAt (LWW) and respects preferLocalOnEqual', () => {
        const local = [
            { id: '1', title: 'Local newer', updatedAt: 200 },
            { id: '2', title: 'Local equal', updatedAt: 100 },
            { id: '3', title: 'Local only', updatedAt: 50 },
        ];
        const cloud = [
            { id: '1', title: 'Cloud older', updatedAt: 100 },
            { id: '2', title: 'Cloud equal', updatedAt: 100 },
            { id: '4', title: 'Cloud only', updatedAt: 150 },
        ];

        const mergedPreferLocal = mergeByUpdatedAt(local, cloud, true);
        expect(mergedPreferLocal.find(i => i.id === '1')?.title).toBe('Local newer');
        expect(mergedPreferLocal.find(i => i.id === '2')?.title).toBe('Local equal');
        expect(mergedPreferLocal.find(i => i.id === '3')?.title).toBe('Local only');
        expect(mergedPreferLocal.find(i => i.id === '4')?.title).toBe('Cloud only');

        const mergedPreferCloud = mergeByUpdatedAt(local, cloud, false);
        expect(mergedPreferCloud.find(i => i.id === '2')?.title).toBe('Cloud equal');
    });

    it('syncs state to Firestore with setDoc merge', async () => {
        state.tasks = [{
            id: 't1',
            title: 'Focus',
            estPomodoros: 2,
            actualPomodoros: 0,
            isCompleted: false,
            isActive: true,
            updatedAt: 123,
        }];
        await syncDataToCloud({ uid: 'user-1' } as any);
        expect(setDoc).toHaveBeenCalledTimes(1);
        const payload = (setDoc as any).mock.calls[0][1];
        expect(payload.tasks).toEqual(state.tasks);
        expect(payload.lastSynced).toBe('mock-timestamp');
    });
});
