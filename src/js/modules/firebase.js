const env = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) ? import.meta.env : {};

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBquo9eoROYOBPujh_tiZBjw0OjZbPQCS4",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "pomodoro-web-1dc50.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "pomodoro-web-1dc50",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "pomodoro-web-1dc50.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944405715848",
    appId: env.VITE_FIREBASE_APP_ID || "1:944405715848:web:0896a081881c340e96783d"
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

export function getAuthRef() { return auth; }
export function getDbRef() { return db; }
export function getGoogleProviderRef() { return googleProvider; }
