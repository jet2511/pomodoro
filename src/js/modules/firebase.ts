import { FirebaseApp } from 'firebase/app';
import { Auth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_FIREBASE_API_KEY) ? (import.meta as any).env : {} as any;

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBquo9eoROYOBPujh_tiZBjw0OjZbPQCS4",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "pomodoro-web-1dc50.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "pomodoro-web-1dc50",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "pomodoro-web-1dc50.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944405715848",
    appId: env.VITE_FIREBASE_APP_ID || "1:944405715848:web:0896a081881c340e96783d"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export async function initFirebaseAuth(): Promise<{ app: FirebaseApp, auth: Auth, googleProvider: GoogleAuthProvider } | null> {
    if (app && auth && googleProvider) return { app, auth, googleProvider };
    try {
        const [{ initializeApp }, { getAuth, GoogleAuthProvider: GAP }] = await Promise.all([
            import("firebase/app"),
            import("firebase/auth")
        ]);
        if (!app) app = initializeApp(firebaseConfig);
        if (!auth) auth = getAuth(app);
        if (!googleProvider) googleProvider = new GAP();
        return { app, auth, googleProvider };
    } catch (e) {
        console.error("Firebase Auth initialization failed:", e);
        return null;
    }
}

export async function initFirestore(): Promise<Firestore | null> {
    if (db) return db;
    try {
        if (!app) await initFirebaseAuth();
        if (!app) return null;
        const { getFirestore } = await import("firebase/firestore");
        db = getFirestore(app);
        return db;
    } catch (e) {
        console.error("Firestore initialization failed:", e);
        return null;
    }
}

export async function initFirebase(): Promise<{ app: FirebaseApp, auth: Auth, db: Firestore, googleProvider: GoogleAuthProvider } | null> {
    const authRes = await initFirebaseAuth();
    const firestoreDb = await initFirestore();
    if (!authRes || !firestoreDb) return null;
    return { ...authRes, db: firestoreDb };
}

export function getAuthRef(): Auth | null { return auth; }
export function getDbRef(): Firestore | null { return db; }
export function getGoogleProviderRef(): GoogleAuthProvider | null { return googleProvider; }
