import { FirebaseApp } from 'firebase/app';
import { Auth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_FIREBASE_API_KEY) ? (import.meta as any).env : {} as any;

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBquo9eoROYOBPujh_tiZBjw0OjZbPQCS4",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? window.location.host : "pomodoro-web-1dc50.firebaseapp.com"),
    projectId: env.VITE_FIREBASE_PROJECT_ID || "pomodoro-web-1dc50",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "pomodoro-web-1dc50.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944405715848",
    appId: env.VITE_FIREBASE_APP_ID || "1:944405715848:web:0896a081881c340e96783d"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export async function initFirebase(): Promise<{ app: FirebaseApp, auth: Auth, db: Firestore, googleProvider: GoogleAuthProvider } | null> {
    if (app && auth && db && googleProvider) return { app, auth, db, googleProvider };
    try {
        const [{ initializeApp }, { getAuth, GoogleAuthProvider: GAP }, { getFirestore }] = await Promise.all([
            import("firebase/app"),
            import("firebase/auth"),
            import("firebase/firestore")
        ]);
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GAP();
        console.log("Firebase modular SDK initialized (Lazy Loaded).");
        return { app, auth, db, googleProvider };
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        return null;
    }
}

export function getAuthRef(): Auth | null { return auth; }
export function getDbRef(): Firestore | null { return db; }
export function getGoogleProviderRef(): GoogleAuthProvider | null { return googleProvider; }
