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
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            googleProvider = new firebase.auth.GoogleAuthProvider();
            console.log("Firebase placeholder initialized.");
        }
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

export function getAuth() { return auth; }
export function getDb() { return db; }
export function getGoogleProvider() { return googleProvider; }
