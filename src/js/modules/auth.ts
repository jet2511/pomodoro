import { User } from 'firebase/auth';
import { initFirebase, getAuthRef, getGoogleProviderRef } from './firebase';
import { elements } from './elements';
import { setupRealtimeSync, unsubscribeRealtimeSync, syncEvents } from './sync';
import { resetLocalState } from './state';
import { renderTasks } from './tasks';
import { updateStatsUI } from './stats';
import { applySettingsToUI } from './settings';

let currentUser: User | null = null;

export async function initAuth(): Promise<void> {
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
            if ((window as any).lucide) (window as any).lucide.createIcons();
            await setupRealtimeSync(user);
        } else {
            console.log("User logged out");
            unsubscribeRealtimeSync();
            showLoggedOutView();
            if ((window as any).lucide) (window as any).lucide.createIcons();
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

export function getCurrentUser(): User | null {
    return currentUser;
}

export function toggleAuthModal(show: boolean): void {
    if (show) {
        elements.authErrorMsg.style.display = 'none';
        elements.authModal.classList.remove('hidden');
    } else {
        elements.authModal.classList.add('hidden');
    }
}

function showLoggedInView(user: User): void {
    elements.authLoggedOutView.style.display = 'none';
    elements.authLoggedInView.style.display = 'block';
    
    const displayName = user.displayName || 'Focus Timer User';
    elements.userDisplayName.textContent = displayName;
    elements.userEmail.textContent = user.email || '';
    
    elements.authUsername.textContent = displayName.split(' ')[0];
    elements.authUsername.style.display = 'inline';
}

function showLoggedOutView(): void {
    elements.authLoggedInView.style.display = 'none';
    elements.authLoggedOutView.style.display = 'block';
    
    elements.authEmail.value = '';
    elements.authPassword.value = '';
    
    elements.authUsername.style.display = 'none';
    updateSyncUI('none');

    resetLocalState();
    renderTasks();
    updateStatsUI();
    applySettingsToUI();
}

function updateSyncUI(status: 'syncing' | 'synced' | 'error' | 'none'): void {
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

function showError(msg: string): void {
    elements.authErrorMsg.textContent = msg;
    elements.authErrorMsg.style.display = 'block';
}

async function signInWithGoogle(): Promise<void> {
    await initFirebase();
    const auth = getAuthRef();
    const provider = getGoogleProviderRef();
    if (!auth || !provider) return showError("Firebase credentials not configured.");
    
    const { signInWithPopup } = await import("firebase/auth");
    try {
        await signInWithPopup(auth, provider);
        toggleAuthModal(false);
    } catch (error: any) {
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

async function handleEmailAuth(e: Event, action: 'login' | 'register'): Promise<void> {
    e.preventDefault();
    if (!elements.emailAuthForm.checkValidity()) {
        elements.emailAuthForm.reportValidity();
        return;
    }

    await initFirebase();
    const auth = getAuthRef();
    if (!auth) return showError("Firebase not configured");

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
    } catch (error: any) {
        let cleanMsg = "An error occurred. Please try again.";
        if (error.code === 'auth/email-already-in-use') cleanMsg = "Email already in use.";
        else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') cleanMsg = "Invalid email or password.";
        else if (error.code === 'auth/too-many-requests') cleanMsg = "Too many attempts. Please try again later.";
        else if (error.code === 'auth/weak-password') cleanMsg = "Password is too weak. Must be at least 6 characters.";
        else if (error.code === 'auth/invalid-email') cleanMsg = "Invalid email format.";
        showError(cleanMsg);
    }
}

async function signOut(): Promise<void> {
    const auth = getAuthRef();
    if (!auth) return;
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    try {
        unsubscribeRealtimeSync();
        await firebaseSignOut(auth);
        toggleAuthModal(false);
    } catch (error) {
        console.error("Sign out error", error);
    }
}
