import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Placeholder Firebase Configuration
// USER MUST REPLACE THIS WITH THEIR ACTUAL CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let app, auth, db, googleProvider;

export function initFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        console.log("Firebase modular SDK initialized.");
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

export function getAppRef() { return app; }
export function getAuthRef() { return auth; }
export function getDbRef() { return db; }
export function getGoogleProviderRef() { return googleProvider; }
