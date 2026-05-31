
import { getDbRef } from './firebase.js';
import { state } from './state.js';
import { saveTasks, renderTasks } from './tasks.js';
import { applySettingsToUI, applyTheme } from './settings.js';
import { updateVolume } from './audio.js';
import { setMode } from './timer.js';

export const syncEvents = {
    onSyncStatusChange: () => { }
};

let isSyncing = false;
export let isLoadingFromCloud = false;

export async function syncDataToCloud(user) {
    if (!user || isSyncing || isLoadingFromCloud) return;
    isSyncing = true;
    
    const db = getDbRef();
    if (!db) {
        isSyncing = false;
        return; // DB not initialized yet (missing real config)
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

export async function loadDataFromCloud(user) {
    if (!user || isLoadingFromCloud) return;
    isLoadingFromCloud = true;
    
    const db = getDbRef();
    if (!db) {
        isLoadingFromCloud = false;
        return;
    }
    
    try {
        const { doc, getDoc } = await import("firebase/firestore");
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Cloud data found, merging with local state...");
            
            // For settings, cloud takes precedence if exists
            if (data.settings && typeof data.settings === 'object') {
                state.settings = { ...state.settings, ...data.settings };
                // Update UI based on new settings
                applySettingsToUI();
                applyTheme();
                updateVolume();
                
                // Only reset mode if timer isn't running so UI updates gracefully
                if (!state.isRunning) {
                   setMode(state.mode);
                }
            }
            
            // For tasks, we merge local and cloud state
            if (Array.isArray(data.tasks)) {
                const localTasks = state.tasks;
                const cloudTasks = data.tasks;
                
                // Keep all cloud tasks, and add any local tasks that aren't in the cloud
                const mergedTasks = [...cloudTasks];
                const cloudTaskIds = new Set(cloudTasks.map(t => t.id));
                
                localTasks.forEach(t => {
                    if (!cloudTaskIds.has(t.id)) {
                        mergedTasks.push(t);
                    }
                });
                
                state.tasks = mergedTasks;
                
                // Re-establish active task id references
                const active = state.tasks.find(t => t.isActive);
                if (active) {
                    state.activeTaskId = active.id;
                } else {
                    state.activeTaskId = null;
                }
                
                // Save locally too
                saveTasks();
                renderTasks();
            }
            
            // Sync focusHistory
            if (data.focusHistory && typeof data.focusHistory === 'object') {
                state.focusHistory = data.focusHistory;
            }
        } else {
            // First time login for this user, push local data up
            console.log("No cloud data found. Pushing local data up.");
            await syncDataToCloud(user);
        }
    } catch (e) {
        console.error("Error loading from cloud:", e);
    } finally {
        isLoadingFromCloud = false;
    }
}
