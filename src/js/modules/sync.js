import { getDb } from './firebase.js';
import { state } from './state.js';
import { saveTasks, renderTasks } from './tasks.js';
import { applySettingsToUI, applyTheme } from './settings.js';
import { updateVolume } from './audio.js';
import { setMode } from './timer.js';

export async function syncDataToCloud(user) {
    if (!user) return;
    const db = getDb();
    if (!db) return; // DB not initialized yet (missing real config)
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({
            tasks: state.tasks,
            settings: state.settings,
            lastSynced: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Data synced to cloud successfully.");
    } catch (e) {
        console.error("Error syncing to cloud:", e);
    }
}

export async function loadDataFromCloud(user) {
    if (!user) return;
    const db = getDb();
    if (!db) return;
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            console.log("Cloud data found, merging with local state...");
            
            // For settings, cloud takes precedence if exists
            if (data.settings) {
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
            
            // For tasks, we overwrite local state with cloud state completely
            if (data.tasks) {
                state.tasks = data.tasks;
                
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
        } else {
            // First time login for this user, push local data up
            console.log("No cloud data found. Pushing local data up.");
            await syncDataToCloud(user);
        }
    } catch (e) {
        console.error("Error loading from cloud:", e);
    }
}
