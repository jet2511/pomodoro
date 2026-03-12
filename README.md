# FocusTimer - Modern Pomodoro web app

A beautiful, functional, and deeply customizable Pomodoro Timer built with Vanilla HTML, CSS, and JavaScript. FocusTimer features a glassmorphism design, task management, dynamic themes, sound customizations, and cloud sync capabilities using Firebase.

![Light Theme UI](.system_generated/click_feedback/click_feedback_1773152882772.png)

## 🚀 LIVE PREVIEW

*Note: Since this is a static project, you can host it anywhere (GitHub Pages, Netlify, Vercel) absolutely free.*

## ✨ Features

*   **⏱️ Three Timer Modes**
    *   **Focus / Pomodoro:** Default 25 minutes.
    *   **Short Break:** Default 5 minutes.
    *   **Long Break:** Default 15 minutes.
    *   Auto-starts breaks or next pomodoros based on your settings.
*   **✅ Built-in Task Management**
    *   Add tasks with estimated Pomodoros.
    *   Set an "Active" task to route finished Pomodoros directly to that task's count.
    *   Mark tasks completed or delete them.
*   **⚙️ Deep Customization (Settings)**
    *   Change duration for all 3 modes and configure the long break interval.
    *   **Alarms:** Choose between Digital Bell, Bird Chirp, or a Retro Alarm.
    *   **Background Sounds:** Play white noise like Clock Ticking or Light Rain while focusing.
    *   Adjust main volume globally.
*   **🎨 Stunning Design**
    *   Sleek **Glassmorphism** overlays.
    *   **Picture-in-Picture (PiP):** Keep the timer always on top in a floating window (Chrome 116+).
    *   Dynamic background colors that adapt based on the mode (Red for Focus, Teal for Short break, Blue for Long Break).
    *   Switch between classic **Dark Mode** and an elegant **Light Mode**.
*   **☁️ Data Options & Cloud Sync**
    *   **Guest Mode (Offline):** Everything (tasks and settings) defaults to save instantly in your browser's `localStorage`. No login required.
    *   **Account Sync (Firebase):** Sign in with Google or Email/Password to sync your tasks and preferences across multiple devices automatically. 

## 🏗️ Architecture & Technology Stack

FocusTimer relies entirely on frontend technologies. No backend framework is required.

*   **Structure:** HTML5 semantics.
*   **Styling:** Custom CSS with CSS Variables, Flexbox, and CSS Transitions. Split into modular files (base, timer, tasks, modal, auth).
*   **Logic:** Modern Vanilla JavaScript (ES Modules). The state is cleanly separated from DOM manipulation.
*   **Icons:** FontAwesome (via CDN).
*   **Font:** Inter (via Google Fonts).
*   **Backend (Optional Sync):** Firebase v10 (Auth & Firestore via compat CDN).

## 💻 Running Locally

Because this project uses JavaScript ES Modules (`type="module"`), you cannot simply double-click the `index.html` file to open it in your browser (due to strict CORS policies for file:// protocols). 

You must serve it over a local web server.

### Option 1: Using Node.js (npx)
If you have Node installed, run this command in the project folder:
```bash
npx serve .
```

### Option 2: Using Python
If you have Python installed, run this command:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080/` in your browser.

## 🔥 Setting up Firebase (For Cloud Sync)

The codebase has all the UI and sync logic ready, but it currently uses a placeholder config. To authorize logins and save data to the cloud, you must link your own Firebase project.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new Web Project.
2.  Enable **Authentication**. Add "Google" and "Email/Password" sign-in methods.
3.  Enable **Firestore Database** in Test Mode (or write secure security rules).
4.  Get your `firebaseConfig` object from the Project Settings -> General tab.
5.  Open `js/modules/firebase.js` in this repository.
6.  Replace the `firebaseConfig` variable with your actual keys:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 🧪 Automated Testing (Node.js)

You can run end-to-end tests to verify Keyboard Shortcuts (`Space`, `S`, `T`, `C`, `P`), Analytics, and Drag & Drop functionality using Playwright.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Install Playwright browsers:**
    ```bash
    npx playwright install
    ```
3.  **Run tests (ensure your local server is running on port 8080):**
    ```bash
    npm test
    ```

## 🤝 Contributing

Feel free to fork this project, make visual tweaks, add new alarm sounds, or modify the Firebase sync logic to fit your specific workflow!
