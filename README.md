# 🍅 FocusTimer Pro

> **Your ultimate productivity companion.** A minimalist, high-performance Pomodoro Timer with a "Smart Square" Picture-in-Picture widget, task management, and seamless cloud sync.

![FocusTimer Preview](.system_generated/click_feedback/click_feedback_1773152882772.png)

## ✨ Killer Feature: Smart Square PiP
Our **Picture-in-Picture (PiP)** mode isn't just a video; it's a **fully interactive 300x300 square widget**.
- **Always on Top**: Keep your timer visible while working in other apps.
- **Locked Aspect Ratio**: Stays a perfect square (300x300) even if you try to resize it.
- **Interactive Controls**: Play/Pause directly from the PiP window.
- **Task Integration**: The name of your active task is visible right inside the PiP circle.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Then visit `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

---

## 🛠 Features

*   **⏱️ Precision Timer Modes**: Focus (25m), Short Break (5m), and Long Break (15m). Auto-transition enabled.
*   **✅ Task Management**: Track your "Estimated vs. Actual" Pomodoros per task.
*   **🎨 Premium Glassmorphism UI**: Beautiful, translucent layers with dark/light mode support.
*   **🔔 Custom Alerts**: Digital, Bird, or Retro alarms with adjustable volume.
*   **💧 Ambient Backgrounds**: Light rain or steady ticking to keep you in the zone.
*   **☁️ Firebase Sync**: Sync tasks across all your devices using Google or Email auth.
*   **📱 PWA Ready**: Install as a standalone desktop or mobile application.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Start / Stop Timer |
| `S` | Skip to the next phase |
| `P` | Toggle Picture-in-Picture (PiP) |
| `T` | Open Task Modal |
| `C` | Open Settings / Customization |

---

## 🏗 Technology Stack

- **Core**: TypeScript, HTML5, CSS3.
- **Bundler**: [Vite](https://vitejs.dev/) (Rapid development & optimized builds).
- **Backend**: [Firebase v12](https://firebase.google.com/) (Firestore & Authentication).
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/).
- **Testing**: [Playwright](https://playwright.dev/) (End-to-end reliability).

---

## 🔥 Firebase Configuration

FocusTimer comes ready with sync logic, but you need to add your own keys for cloud storage:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Enable **Firestore** and **Authentication** (Google/Email).
3. Copy your Web App config and paste it into `src/js/modules/firebase.ts`:

```javascript
const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    // ... rest of your config
};
```

---

## 🧪 Testing

We use Playwright to ensure every shortcut and timer state works perfectly.

```bash
npx playwright install
npm test
```

---

## 🤝 Contributing

Feel free to fork and enhance our design! If you find a bug in our PiP logic or have a new alarm sound to suggest, PRs are welcome.

*Built with ❤️ for productivity.*
