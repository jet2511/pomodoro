# Google Auth & Firestore Pomodoro Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 1-click Google Sign-In authentication via Firebase Popup and real-time bi-directional synchronization for Pomodoro tasks, settings, and focus history with Firestore.

**Architecture:** Utilize Firebase v12 Web SDK with lazy-loaded dynamic ES imports (`firebase/app`, `firebase/auth`, `firebase/firestore`). Centralized state in `state.js` triggers debounced outbound sync via `sync.js`, while an `onSnapshot` realtime listener handles inbound changes across devices/tabs with smart local/cloud data union merge on login.

**Tech Stack:** Vanilla JavaScript (ES Modules), Vite, Firebase Web SDK v12, Firestore, HTML5/CSS3.

---

### File Structure Map

- `src/js/modules/firebase.js` - Firebase SDK initialization with dynamic imports & ref getters
- `src/js/modules/auth.js` - Google popup login flow, auth state listener, UI state updates
- `src/js/modules/sync.js` - Realtime Firestore sync (`onSnapshot`), debounced write (`setDoc`), smart data merging
- `src/js/modules/state.js` - Fix date timezone formatting mismatch in `focusHistory`
- `tests/sync.spec.js` - Playwright E2E / integration test cases for auth UI & cloud sync handlers

---

### Task 1: Fix Focus History Date Format Mismatch (`timer.js` & `state.js`)

**Files:**
- Modify: `src/js/modules/timer.js:215-225`
- Modify: `src/js/modules/state.js:53-62`

- [ ] **Step 1: Inspect date formatting in `timer.js`**

Verify that `timer.js` uses `new Date().toLocaleDateString('en-CA')` instead of `new Date().toISOString().split('T')[0]`.

- [ ] **Step 2: Update `timer.js` to use local date string**

```javascript
// In src/js/modules/timer.js -> handleTimerComplete()
const today = new Date().toLocaleDateString('en-CA');
if (!state.focusHistory[today]) {
    state.focusHistory[today] = { seconds: 0, pomodoros: 0 };
}
state.focusHistory[today].pomodoros++;

const elapsedSeconds = Math.round(sessionAccumulatedMs / 1000);
state.focusHistory[today].seconds += elapsedSeconds;
sessionAccumulatedMs = 0;
```

- [ ] **Step 3: Update `stopTimer` in `timer.js` to clear `targetEndTime` on pause**

```javascript
// In src/js/modules/timer.js -> stopTimer(completed = false)
if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
}

if (sessionStartTime) {
    sessionAccumulatedMs += (Date.now() - sessionStartTime);
    sessionStartTime = null;
}

targetEndTime = null; // Prevent stale timestamp reference when unpaused
state.isRunning = false;
```

- [ ] **Step 4: Commit changes**

```bash
git add src/js/modules/timer.js
git commit -m "fix: synchronize focusHistory date format with local timezone and clear targetEndTime on timer pause"
```

---

### Task 2: Enhance Firebase Initialization (`src/js/modules/firebase.js`)

**Files:**
- Modify: `src/js/modules/firebase.js`

- [ ] **Step 1: Check `firebase.js` dynamic imports and exports**

Ensure `initFirebase()` lazily loads `firebase/app`, `firebase/auth`, and `firebase/firestore` asynchronously and handles error cases gracefully when API key environment variables are missing.

- [ ] **Step 2: Update `src/js/modules/firebase.js` code**

```javascript
// src/js/modules/firebase.js
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

export async function initFirebase() {
    if (app) return { app, auth, db, googleProvider };
    try {
        const [{ initializeApp }, { getAuth, GoogleAuthProvider }, { getFirestore }] = await Promise.all([
            import("firebase/app"),
            import("firebase/auth"),
            import("firebase/firestore")
        ]);
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        console.log("Firebase modular SDK initialized (Lazy Loaded).");
        return { app, auth, db, googleProvider };
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        return null;
    }
}

export function getAppRef() { return app; }
export function getAuthRef() { return auth; }
export function getDbRef() { return db; }
export function getGoogleProviderRef() { return googleProvider; }
```

- [ ] **Step 3: Commit changes**

```bash
git add src/js/modules/firebase.js
git commit -m "refactor: improve lazy loading and reference getters in firebase module"
```

---

### Task 3: Implement Real-Time Cloud Sync & Smart Merge (`src/js/modules/sync.js`)

**Files:**
- Modify: `src/js/modules/sync.js`

- [ ] **Step 1: Implement `setupRealtimeSync` and `unsubscribeRealtimeSync`**

Add `onSnapshot` listener to `users/{user.uid}` document for real-time inbound synchronization and export `unsubscribeRealtimeSync()` for clean logout.

- [ ] **Step 2: Update `src/js/modules/sync.js` code**

```javascript
// src/js/modules/sync.js
import { getDbRef } from './firebase.js';
import { state } from './state.js';
import { saveTasks, renderTasks } from './tasks.js';
import { applySettingsToUI, applyTheme } from './settings.js';
import { updateVolume } from './audio.js';
import { setMode } from './timer.js';
import { updateStatsUI } from './stats.js';

export const syncEvents = {
    onSyncStatusChange: () => { }
};

let isSyncing = false;
export let isLoadingFromCloud = false;
let unsubscribeSnapshot = null;

export async function syncDataToCloud(user) {
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

export async function setupRealtimeSync(user) {
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

export function unsubscribeRealtimeSync() {
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }
}
```

- [ ] **Step 3: Commit changes**

```bash
git add src/js/modules/sync.js
git commit -m "feat: add real-time Firestore listener with onSnapshot and smart task merging"
```

---

### Task 4: Complete Google Auth Popup & UI Integration (`src/js/modules/auth.js`)

**Files:**
- Modify: `src/js/modules/auth.js`

- [ ] **Step 1: Wire `setupRealtimeSync` and `unsubscribeRealtimeSync` into `auth.js`**

Ensure `signInWithGoogle` handles `signInWithPopup`, maps user credentials, attaches the realtime sync listener, and handles popup cancellation/blocked edge cases gracefully.

- [ ] **Step 2: Update `src/js/modules/auth.js` code**

```javascript
// src/js/modules/auth.js
import { initFirebase, getAuthRef, getGoogleProviderRef } from './firebase.js';
import { elements } from './elements.js';
import { setupRealtimeSync, unsubscribeRealtimeSync, syncEvents } from './sync.js';

let currentUser = null;

export async function initAuth() {
    await initFirebase();
    const auth = getAuthRef();
    if (!auth) return;
    
    const { onAuthStateChanged } = await import("firebase/auth");
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            console.log("User logged in:", user.email);
            showLoggedInView(user);
            if (window.lucide) window.lucide.createIcons();
            await setupRealtimeSync(user);
        } else {
            console.log("User logged out");
            unsubscribeRealtimeSync();
            showLoggedOutView();
            if (window.lucide) window.lucide.createIcons();
        }
    });

    // Event Listeners
    elements.authBtn.addEventListener('click', () => toggleAuthModal(true));
    elements.closeAuthBtn.addEventListener('click', () => toggleAuthModal(false));
    
    elements.googleLoginBtn.addEventListener('click', signInWithGoogle);
    elements.emailLoginBtn.addEventListener('click', (e) => handleEmailAuth(e, 'login'));
    elements.emailRegisterBtn.addEventListener('click', (e) => handleEmailAuth(e, 'register'));
    
    syncEvents.onSyncStatusChange = (status) => {
        updateSyncUI(status);
    };

    elements.logoutBtn.addEventListener('click', signOut);
}

export function getCurrentUser() {
    return currentUser;
}

export function toggleAuthModal(show) {
    if (show) {
        elements.authErrorMsg.style.display = 'none';
        elements.authModal.classList.remove('hidden');
    } else {
        elements.authModal.classList.add('hidden');
    }
}

function showLoggedInView(user) {
    elements.authLoggedOutView.style.display = 'none';
    elements.authLoggedInView.style.display = 'block';
    
    const displayName = user.displayName || 'Focus Timer User';
    elements.userDisplayName.textContent = displayName;
    elements.userEmail.textContent = user.email;
    
    elements.authUsername.textContent = displayName.split(' ')[0];
    elements.authUsername.style.display = 'inline';
}

function showLoggedOutView() {
    elements.authLoggedInView.style.display = 'none';
    elements.authLoggedOutView.style.display = 'block';
    
    elements.authEmail.value = '';
    elements.authPassword.value = '';
    
    elements.authUsername.style.display = 'none';
    updateSyncUI('none');
}

function updateSyncUI(status) {
    const indicator = elements.syncIndicator;
    if (!indicator) return;

    indicator.classList.remove('syncing', 'synced', 'error');
    
    if (status === 'syncing') {
        indicator.textContent = 'Syncing...';
        indicator.classList.add('syncing');
    } else if (status === 'synced') {
        indicator.textContent = 'Synced';
        indicator.classList.add('synced');
    } else if (status === 'error') {
        indicator.textContent = 'Sync Error';
        indicator.classList.add('error');
    } else if (status === 'none') {
        indicator.textContent = 'Not Logged In';
    }
}

function showError(msg) {
    elements.authErrorMsg.textContent = msg;
    elements.authErrorMsg.style.display = 'block';
}

async function signInWithGoogle() {
    await initFirebase();
    const auth = getAuthRef();
    const provider = getGoogleProviderRef();
    if (!auth || !provider) return showError("Firebase credentials not configured.");
    
    const { signInWithPopup } = await import("firebase/auth");
    try {
        await signInWithPopup(auth, provider);
        toggleAuthModal(false);
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            // Silently ignore user closing popup
            return;
        } else if (error.code === 'auth/popup-blocked') {
            showError("Popup blocked by browser. Please allow popups for this site.");
        } else {
            showError(error.message || "Failed to sign in with Google.");
        }
    }
}

async function handleEmailAuth(e, action) {
    e.preventDefault();
    if (!elements.emailAuthForm.checkValidity()) {
        elements.emailAuthForm.reportValidity();
        return;
    }

    await initFirebase();
    const auth = getAuthRef();
    if (!auth) return showError("Firebase credentials not configured.");

    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    
    const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
    try {
        if (action === 'login') {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        toggleAuthModal(false);
    } catch (error) {
        let cleanMsg = "An error occurred. Please try again.";
        if (error.code === 'auth/email-already-in-use') cleanMsg = "Email already in use.";
        else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') cleanMsg = "Invalid email or password.";
        else if (error.code === 'auth/too-many-requests') cleanMsg = "Too many attempts. Please try again later.";
        else if (error.code === 'auth/weak-password') cleanMsg = "Password is too weak. Must be at least 6 characters.";
        else if (error.code === 'auth/invalid-email') cleanMsg = "Invalid email format.";
        showError(cleanMsg);
    }
}

async function signOut() {
    const auth = getAuthRef();
    if (!auth) return;
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    try {
        await firebaseSignOut(auth);
        toggleAuthModal(false);
    } catch (error) {
        console.error("Sign out error", error);
    }
}
```

- [ ] **Step 3: Commit changes**

```bash
git add src/js/modules/auth.js
git commit -m "feat: complete Google popup authentication and integrate with realtime cloud sync"
```

---

### Task 5: Remove Dev Badge & Finalize Auth UI (`index.html`)

**Files:**
- Modify: `index.html:220-225`

- [ ] **Step 1: Remove "Tính năng đang phát triển" badge in `index.html`**

Update `#auth-logged-out-view` in `index.html` to reflect that Google Login & Cloud Sync are now fully active.

```html
<!-- index.html -> auth-modal -> auth-logged-out-view -->
<div id="auth-logged-out-view">
    <p class="auth-description">Sign in to sync your tasks, settings, and focus history across devices.</p>

    <button id="google-login-btn" class="auth-provider-btn google-btn">
        <i class="fa-brands fa-google"></i> Continue with Google
    </button>
```

- [ ] **Step 2: Commit changes**

```bash
git add index.html
git commit -m "style: remove dev badge from auth modal UI"
```

---

### Self-Review Checklist

1. **Spec coverage:** Google Popup Auth, Realtime Sync (`onSnapshot`), Smart Task Union Merge, Focus History date fix, Error handling, and UI removal of dev badge are all covered.
2. **Placeholder scan:** No TBDs, TODOs, or missing code snippets.
3. **Type consistency:** Function names (`signInWithGoogle`, `setupRealtimeSync`, `unsubscribeRealtimeSync`, `updateSyncUI`) match across `auth.js`, `sync.js`, and `firebase.js`.
