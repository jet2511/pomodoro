import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { initFirebase, getAuthRef, getGoogleProviderRef } from './firebase.js';
import { elements } from './elements.js';
import { loadDataFromCloud } from './sync.js';

let currentUser = null;

export function initAuth() {
    initFirebase();
    const auth = getAuthRef();
    if (!auth) return;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            console.log("User logged in:", user.email);
            showLoggedInView(user);
            await loadDataFromCloud(user);
        } else {
            console.log("User logged out");
            showLoggedOutView();
        }
    });

    // Event Listeners
    elements.authBtn.addEventListener('click', () => toggleAuthModal(true));
    elements.closeAuthBtn.addEventListener('click', () => toggleAuthModal(false));
    
    elements.googleLoginBtn.addEventListener('click', signInWithGoogle);
    elements.emailLoginBtn.addEventListener('click', (e) => handleEmailAuth(e, 'login'));
    elements.emailRegisterBtn.addEventListener('click', (e) => handleEmailAuth(e, 'register'));
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
    
    // Update header button
    elements.authUsername.textContent = displayName.split(' ')[0];
    elements.authUsername.style.display = 'inline';
}

function showLoggedOutView() {
    elements.authLoggedInView.style.display = 'none';
    elements.authLoggedOutView.style.display = 'block';
    
    // Reset inputs
    elements.authEmail.value = '';
    elements.authPassword.value = '';
    
    // Update header button
    elements.authUsername.style.display = 'none';
}

function showError(msg) {
    elements.authErrorMsg.textContent = msg;
    elements.authErrorMsg.style.display = 'block';
}

async function signInWithGoogle() {
    const auth = getAuthRef();
    const provider = getGoogleProviderRef();
    if (!auth || !provider) return showError("Firebase not configured");
    
    try {
        await signInWithPopup(auth, provider);
        toggleAuthModal(false);
    } catch (error) {
        showError(error.message);
    }
}

async function handleEmailAuth(e, action) {
    e.preventDefault();
    if (!elements.emailAuthForm.checkValidity()) {
        elements.emailAuthForm.reportValidity();
        return;
    }

    const auth = getAuthRef();
    if (!auth) return showError("Firebase not configured");

    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    
    try {
        if (action === 'login') {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        toggleAuthModal(false);
    } catch (error) {
        let cleanMsg = error.message;
        if(error.code === 'auth/email-already-in-use') cleanMsg = "Email already in use.";
        if(error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') cleanMsg = "Invalid email or password.";
        showError(cleanMsg);
    }
}

async function signOut() {
    const auth = getAuthRef();
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
        toggleAuthModal(false);
    } catch (error) {
        console.error("Sign out error", error);
    }
}
