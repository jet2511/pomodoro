# Design Spec: TypeScript Migration and PiP Memory Cleanup

This document outlines the architecture, components, and implementation plan for upgrading the FocusTimer Pomodoro application with type safety and robust memory management.

## 1. Objectives

- **Type Safety**: Upgrade the JavaScript code to TypeScript (`.ts`) to ensure clean contracts, autocomplete, and static error checking.
- **Memory Optimization**: Resolve potential memory leaks in the Picture-in-Picture (PiP) module by introducing a structured cleanup registry.
- **Maintainability**: Follow code standards outlined in [frontend-dev-guidelines](file:///C:/Users/tuyen.hale/.gemini/config/skills/frontend-dev-guidelines/SKILL.md) as much as possible for a Vanilla TS setup.

---

## 2. Proposed Changes

### 2.1. Project Infrastructure & Tooling

To support TypeScript compile-time checks, we will introduce the TypeScript compiler and configuration.

#### [NEW] [tsconfig.json](file:///d:/Projects/Personal/AI/_pet/pomodoro/tsconfig.json)

A standard tsconfig tailored for Vite-based frontend bundling.
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

#### [MODIFY] [package.json](file:///d:/Projects/Personal/AI/_pet/pomodoro/package.json)

- Install `typescript` as a devDependency.
- Update scripts if necessary (e.g. `tsc --noEmit` before build).

---

### 2.2. Type Definitions

We will create a centralized module for state, settings, tasks, and history type definitions.

#### [NEW] [types.ts](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/types/index.ts)

```typescript
export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actualPomodoros: number;
    isCompleted: boolean;
    isActive: boolean;
}

export interface Settings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    alarmSound: 'bell' | 'bird' | 'digital';
    tickingSound: 'none' | 'tick' | 'rain';
    volume: number;
    darkMode: boolean;
}

export interface FocusHistoryDay {
    seconds: number;
    pomodoros: number;
}

export interface FocusHistory {
    [date: string]: FocusHistoryDay;
}

export interface State {
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    timeRemaining: number;
    isRunning: boolean;
    timerId: number | null;
    pomodorosCompleted: number;
    tasks: Task[];
    activeTaskId: string | null;
    settings: Settings;
    focusHistory: FocusHistory;
}
```

---

### 2.3. Source Code Migration (.js to .ts)

All current source files in `src/js/` and `src/js/modules/` will be renamed and refactored:

- [app.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/app.js) -> `app.ts`
- [modules/elements.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/elements.js) -> `elements.ts`
- [modules/state.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/state.js) -> `state.ts`
- [modules/timer.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/timer.js) -> `timer.ts`
- [modules/tasks.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/tasks.js) -> `tasks.ts`
- [modules/settings.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/settings.js) -> `settings.ts`
- [modules/pip.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/pip.js) -> `pip.ts`
- [modules/auth.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/auth.js) -> `auth.ts`
- [modules/sync.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/sync.js) -> `sync.ts`
- [modules/firebase.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/firebase.js) -> `firebase.ts`
- [modules/utils.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/utils.js) -> `utils.ts`
- [modules/stats.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/stats.js) -> `stats.ts`
- [modules/audio.js](file:///d:/Projects/Personal/AI/_pet/pomodoro/src/js/modules/audio.js) -> `audio.ts`

#### Code Adjustments:
- Remove `.js` extension from static imports:
  `import { elements } from './modules/elements.js';` -> `import { elements } from './modules/elements';`
- Fix type assertions where DOM elements can be null or require typecasting (e.g., `HTMLInputElement`).
- Bind type annotations to global `window` objects (e.g., `window.lucide`).

---

### 2.4. Memory Leak Fix in `pip.ts`

Implement a clean-up registry to release observers, listeners, and references when the Picture-in-Picture window is closed.

```typescript
let pipCleanups: Array<() => void> = [];

// Clean up all allocated PiP resources
function runPipCleanups() {
    pipCleanups.forEach(cleanup => {
        try {
            cleanup();
        } catch (e) {
            console.error('Error during PiP cleanup execution:', e);
        }
    });
    pipCleanups = [];
}
```

Whenever resources are registered during `togglePiP()`, we will add their tear-down callbacks into `pipCleanups`:
1. **Observers**:
   ```typescript
   const observer = new MutationObserver(updateUI);
   observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
   pipCleanups.push(() => observer.disconnect());
   ```
2. **Event Listeners**:
   ```typescript
   const handleKeyDown = (e: KeyboardEvent) => { ... };
   pipWindow.document.addEventListener('keydown', handleKeyDown);
   pipCleanups.push(() => pipWindow.document.removeEventListener('keydown', handleKeyDown));
   ```
3. **Window events**:
   ```typescript
   pipWindow.addEventListener('pagehide', () => {
       console.log('PiP: Closing and restoring...');
       runPipCleanups();
       // Restore DOM nodes
       ...
   });
   ```

---

## 3. Verification Plan

### 3.1. Automated Verification
- Run `npx tsc --noEmit` to ensure there are no compile-time type errors.
- Run `npm run build` to verify Vite bundle compiles with ES modules and PWA service workers.

### 3.2. Manual Verification
- **Timer & Flow**: Ensure Pomodoro, Short Break, Long Break cycles work correctly.
- **Picture-in-Picture**: Open PiP, interact with Play/Pause and Skip buttons. Close PiP and verify the DOM tree restores properly without console errors or lost states.
- **Settings & Auth**: Validate sync to Firebase Firestore and Dark Mode styling.
