import { User } from 'firebase/auth';
import { getDbRef } from './firebase';
import { state } from './state';
import { saveTasks, renderTasks } from './tasks';
import { applySettingsToUI, applyTheme } from './settings';
import { updateVolume } from './audio';
import { setMode } from './timer';
import { updateStatsUI } from './stats';

export const syncEvents = {
    onSyncStatusChange: (_status: 'syncing' | 'synced' | 'error' | 'none') => { }
};

let isSyncing = false;
export let isLoadingFromCloud = false;
let unsubscribeSnapshot: (() => void) | null = null;

export async function syncDataToCloud(user: User): Promise<void> {
    if (!user || isSyncing || isLoadingFromCloud) return;
    isSyncing = true;
    
    const db = getDbRef();
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
            settings: state.settings,
            focusHistory: state.focusHistory,
            lastSynced: serverTimestamp()
        }, { merge: true });
        syncEvents.onSyncStatusChange('synced');
        console.log("Data synced to cloud successfully.");
    } catch (e) {
        syncEvents.onSyncStatusChange('error');
        console.error("Error syncing to cloud:", e);
    } finally {
        isSyncing = false;
    }
}

export async function setupRealtimeSync(user: User): Promise<void> {
    if (!user) return;
    const db = getDbRef();
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
                
                // Merge Settings
                if (data.settings && typeof data.settings === 'object') {
                    state.settings = { ...state.settings, ...data.settings };
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
                    const active = state.tasks.find(t => t.isActive);
                    state.activeTaskId = active ? active.id : null;
                    
                    saveTasks();
                    renderTasks();
                }
                
                // Merge Focus History
                if (data.focusHistory && typeof data.focusHistory === 'object') {
                    state.focusHistory = { ...state.focusHistory, ...data.focusHistory };
                    updateStatsUI();
                }
                
                syncEvents.onSyncStatusChange('synced');
                isLoadingFromCloud = false;
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
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }
}
