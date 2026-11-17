import { User } from 'firebase/auth';
import { getDbRef, initFirestore } from './firebase';
import { state } from './state';
import { elements } from './elements';
import { saveTasks, renderTasks, renderArchiveModal } from './tasks';
import { applySettingsToUI, applyTheme } from './settings';
import { updateVolume } from './audio';
import { setMode } from './timer';
import { updateStatsUI } from './stats';
import { saveCategories, renderCategoryFilters, renderCategoryOptions } from './categories';

export const syncEvents = {
    onSyncStatusChange: (_status: 'syncing' | 'synced' | 'error' | 'none') => { }
};

let isSyncing = false;
export let isLoadingFromCloud = false;
let hasPendingLocalChanges = false;
let unsubscribeSnapshot: (() => void) | null = null;

export function markLocalChangesPending(): void {
    hasPendingLocalChanges = true;
}

export function mergeByUpdatedAt<T extends { id: string; updatedAt?: number }>(
    localItems: T[],
    cloudItems: T[],
    preferLocalOnEqual: boolean = false
): T[] {
    const merged = new Map<string, T>();
    cloudItems.forEach(item => merged.set(item.id, item));
    localItems.forEach(localItem => {
        const cloudItem = merged.get(localItem.id);
        if (!cloudItem) {
            merged.set(localItem.id, localItem);
            return;
        }
        const localTs = localItem.updatedAt ?? 0;
        const cloudTs = cloudItem.updatedAt ?? 0;
        if (localTs > cloudTs || (preferLocalOnEqual && localTs === cloudTs)) {
            merged.set(localItem.id, localItem);
        }
    });
    return Array.from(merged.values());
}

export async function syncDataToCloud(user: User): Promise<void> {
    if (!user || isSyncing || isLoadingFromCloud) return;
    isSyncing = true;
    
    const db = getDbRef() || await initFirestore();
    if (!db) {
        isSyncing = false;
        return;
    }
    
    syncEvents.onSyncStatusChange('syncing');
    try {
        const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            tasks: state.tasks,
            categories: state.categories,
            settings: state.settings,
            focusHistory: state.focusHistory,
            lastSynced: serverTimestamp()
        }, { merge: true });
        hasPendingLocalChanges = false;
        syncEvents.onSyncStatusChange('synced');
    } catch (e) {
        syncEvents.onSyncStatusChange('error');
        console.error("Error syncing to cloud:", e);
    } finally {
        isSyncing = false;
    }
}

export async function setupRealtimeSync(user: User): Promise<void> {
    if (!user) return;
    const db = getDbRef() || await initFirestore();
    if (!db) return;

    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }

    try {
        const { doc, onSnapshot } = await import("firebase/firestore");
        const userRef = doc(db, 'users', user.uid);

        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (isSyncing) return; // Prevent loop when local change initiated write
            if (docSnap.exists()) {
                const data = docSnap.data();
                isLoadingFromCloud = true;
                try {
                    // Merge Settings (skip overwrite while local changes are pending)
                    if (!hasPendingLocalChanges && data.settings && typeof data.settings === 'object') {
                        state.settings = { ...state.settings, ...data.settings };
                        applySettingsToUI();
                        applyTheme();
                        updateVolume();
                        if (!state.isRunning) {
                            setMode(state.mode);
                        }
                    }

                    // Merge Tasks (LWW by updatedAt)
                    if (Array.isArray(data.tasks)) {
                        state.tasks = mergeByUpdatedAt(state.tasks, data.tasks, hasPendingLocalChanges);
                        const active = state.tasks.find(t => t.isActive && !t.isArchived && !t.deletedAt);
                        state.activeTaskId = active ? active.id : null;

                        saveTasks();
                        renderTasks();

                        if (elements.archiveModal && !elements.archiveModal.classList.contains('hidden')) {
                            const searchVal = elements.archiveSearchInput ? elements.archiveSearchInput.value : '';
                            renderArchiveModal(searchVal);
                        }
                    }

                    // Merge Categories (LWW by updatedAt)
                    if (Array.isArray(data.categories)) {
                        state.categories = mergeByUpdatedAt(state.categories, data.categories, hasPendingLocalChanges);
                        saveCategories();
                        renderCategoryFilters();
                        renderCategoryOptions();
                    }

                    // Merge Focus History (preserve local entries if pending)
                    if (data.focusHistory && typeof data.focusHistory === 'object') {
                        state.focusHistory = hasPendingLocalChanges
                            ? { ...data.focusHistory, ...state.focusHistory }
                            : { ...state.focusHistory, ...data.focusHistory };
                        updateStatsUI();
                    }

                    syncEvents.onSyncStatusChange('synced');
                } finally {
                    isLoadingFromCloud = false;
                }
            }
        }, (err) => {
            console.error("Realtime sync error:", err);
            syncEvents.onSyncStatusChange('error');
        });
    } catch (e) {
        console.error("Failed to setup realtime sync listener:", e);
    }
}

export function unsubscribeRealtimeSync(): void {
    hasPendingLocalChanges = false;
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }
}
