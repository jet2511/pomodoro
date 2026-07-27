const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
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
