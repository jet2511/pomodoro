# User Data Lifecycle (Login/Logout) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement robust user data retrieval, smart merging on login, and complete data cleanup on logout.

**Architecture:** Extend `auth.js` and `sync.js` to manage data lifecycle transitions. On login, perform smart union merge of guest tasks with cloud data; on logout, clear in-memory state and LocalStorage to prevent data leaks.

**Tech Stack:** Vanilla JavaScript (ESM), Firebase v10 Auth & Firestore, Playwright E2E.

---

### Task 1: Add State Cleanup & Reset on Logout

**Files:**
- Modify: `src/js/modules/state.js`
- Modify: `src/js/modules/auth.js`

- [ ] **Step 1: Define `resetLocalState()` in `state.js`**

Add function to `src/js/modules/state.js`:
```javascript
export function resetLocalState() {
    state.tasks = [];
    state.settings = { ...DEFAULT_SETTINGS };
    state.focusHistory = {};
    localStorage.removeItem('pomodoro_tasks');
    localStorage.removeItem('pomodoro_settings');
    localStorage.removeItem('pomodoro_history');
}
```

- [ ] **Step 2: Update `signOut()` in `auth.js` to invoke `resetLocalState()`**

In `src/js/modules/auth.js`:
```javascript
import { resetLocalState } from './state.js';

export async function signOut() {
    await initFirebase();
    const auth = getAuthRef();
    if (!auth) return;
    
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    try {
        unsubscribeRealtimeSync();
        await firebaseSignOut(auth);
        resetLocalState();
        showLoggedOutView();
    } catch (error) {
        console.error("Sign out error:", error);
    }
}
```

- [ ] **Step 3: Commit Task 1**

```bash
git add src/js/modules/state.js src/js/modules/auth.js
git commit -m "feat: add resetLocalState on logout to purge local storage and state"
```

---

### Task 2: Enhance Smart Union Merge on Login in `sync.js`

**Files:**
- Modify: `src/js/modules/sync.js`

- [ ] **Step 1: Verify and refine `mergeDataOnLogin` in `sync.js`**

In `src/js/modules/sync.js`:
```javascript
export async function mergeDataOnLogin(user, cloudData) {
    const localTasks = state.tasks || [];
    const cloudTasks = cloudData.tasks || [];

    // Union merge: Add local tasks that do not exist in cloudTasks (by ID)
    const cloudTaskIds = new Set(cloudTasks.map(t => t.id));
    const newTasksFromLocal = localTasks.filter(t => !cloudTaskIds.has(t.id));
    const mergedTasks = [...cloudTasks, ...newTasksFromLocal];

    // Merge settings (Cloud takes priority if present, fallback to local)
    const mergedSettings = { ...state.settings, ...(cloudData.settings || {}) };

    // Merge focusHistory
    const mergedHistory = { ...(cloudData.focusHistory || {}), ...(state.focusHistory || {}) };

    const mergedPayload = {
        tasks: mergedTasks,
        settings: mergedSettings,
        focusHistory: mergedHistory,
        lastSynced: new Date().toISOString()
    };

    // Update state and cloud
    state.tasks = mergedTasks;
    state.settings = mergedSettings;
    state.focusHistory = mergedHistory;
    saveStateToLocalStorage();

    await syncDataToCloud(user, mergedPayload);
}
```

- [ ] **Step 2: Commit Task 2**

```bash
git add src/js/modules/sync.js
git commit -m "feat: enhance smart union merge of guest tasks on user login"
```

---

### Task 3: E2E Verification

**Files:**
- Test: `tests/pip.spec.js` or new test

- [ ] **Step 1: Run E2E test via Playwright**

Run: `npx playwright test`
Expected: PASS

- [ ] **Step 2: Commit Task 3**

```bash
git add .
git commit -m "test: verify user data login and logout lifecycle"
```
