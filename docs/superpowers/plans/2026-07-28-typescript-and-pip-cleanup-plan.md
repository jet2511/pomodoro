# TypeScript Migration & PiP Memory Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the FocusTimer application from JavaScript to TypeScript for type safety and implement a cleanup registry in the Picture-in-Picture module to resolve memory leaks.

**Architecture:** Initialize a standard `tsconfig.json` for Vite. Rename and migrate source code files from `.js` to `.ts` task-by-task, updating imports and resolving type annotations. Implement a `pipCleanups` registry in `pip.ts` to capture and execute teardowns (MutationObservers, EventListeners) when the PiP window closes.

**Tech Stack:** TypeScript, Vite, Firebase Modular SDK v10+, HTML5 Document Picture-in-Picture API.

---

### Task 1: Setup TypeScript Infrastructure

**Files:**
- Create: `tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: Install TypeScript**
  Run: `npm install -D typescript`
  Expected: Install completes, `devDependencies` in `package.json` includes `"typescript"`.

- [ ] **Step 2: Create tsconfig.json**
  Write configuration to `tsconfig.json`:
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

- [ ] **Step 3: Run TypeScript compiler dry-run**
  Run: `npx tsc --noEmit`
  Expected: Command runs successfully (it might show errors on files that are not fully TS-compatible yet, which is expected before migration).

- [ ] **Step 4: Commit**
  ```bash
  git add package.json package-lock.json tsconfig.json
  git commit -m "chore: setup typescript infrastructure"
  ```

---

### Task 2: Create Core Type Definitions

**Files:**
- Create: `src/js/types/index.ts`

- [ ] **Step 1: Write type definitions**
  Write definitions in `src/js/types/index.ts`:
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

- [ ] **Step 2: Commit**
  ```bash
  git add src/js/types/index.ts
  git commit -m "feat: add core type definitions"
  ```

---

### Task 3: Migrate elements.ts and state.ts

**Files:**
- Create: `src/js/modules/elements.ts` (via renaming)
- Create: `src/js/modules/state.ts` (via renaming)

- [ ] **Step 1: Rename files via git**
  Run:
  ```bash
  git mv src/js/modules/elements.js src/js/modules/elements.ts
  git mv src/js/modules/state.js src/js/modules/state.ts
  ```

- [ ] **Step 2: Refactor elements.ts**
  Verify properties are strongly typed and cast to specific element types if needed, resolving typing on `elements` registry.
  Ensure all imported/exported references are clean.

- [ ] **Step 3: Refactor state.ts**
  Import `State` and `DEFAULT_SETTINGS` from `./types` or declare them inline.
  Refactor `state.ts`:
  ```typescript
  import { State, Settings } from '../types/index';

  export const DEFAULT_SETTINGS: Settings = {
      pomodoro: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      alarmSound: 'bell',
      tickingSound: 'none',
      volume: 50,
      darkMode: true
  };

  export const state: State = {
      mode: 'pomodoro',
      timeRemaining: 25 * 60,
      isRunning: false,
      timerId: null,
      pomodorosCompleted: 0,
      tasks: [],
      activeTaskId: null,
      settings: { ...DEFAULT_SETTINGS },
      focusHistory: {}
  };

  export const stateEvents = {
      onStateChange: (state: State) => { }
  };

  export function notifyStateChange() {
      stateEvents.onStateChange(state);
  }

  export function loadSettings() {
      const saved = localStorage.getItem('pomodoro_settings');
      if (saved) {
          try {
              const data = JSON.parse(saved);
              if (data.settings) {
                  state.settings = { ...state.settings, ...data.settings };
              } else if (data.pomodoro) {
                  state.settings = { ...state.settings, ...data };
              }
              state.focusHistory = data.focusHistory || {};
          } catch (e) {
              console.error("Failed to parse pomodoro_settings from localStorage", e);
          }
      }
  }

  export function saveSettings() {
      const historyKeys = Object.keys(state.focusHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (historyKeys.length > 365) {
          const newHistory: typeof state.focusHistory = {};
          for (let i = 0; i < 365; i++) {
              newHistory[historyKeys[i]] = state.focusHistory[historyKeys[i]];
          }
          state.focusHistory = newHistory;
      }

      localStorage.setItem('pomodoro_settings', JSON.stringify({
          settings: state.settings,
          focusHistory: state.focusHistory
      }));
  }

  export function resetLocalState() {
      state.tasks = [];
      state.activeTaskId = null;
      state.settings = { ...DEFAULT_SETTINGS };
      state.focusHistory = {};
      localStorage.removeItem('pomodoro_tasks');
      localStorage.removeItem('pomodoro_settings');
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git commit -m "refactor: migrate elements and state modules to TypeScript"
  ```

---

### Task 4: Migrate utils.ts, audio.ts and stats.ts

**Files:**
- Create: `src/js/modules/utils.ts` (via renaming)
- Create: `src/js/modules/audio.ts` (via renaming)
- Create: `src/js/modules/stats.ts` (via renaming)

- [ ] **Step 1: Rename files**
  Run:
  ```bash
  git mv src/js/modules/utils.js src/js/modules/utils.ts
  git mv src/js/modules/audio.js src/js/modules/audio.ts
  git mv src/js/modules/stats.js src/js/modules/stats.ts
  ```

- [ ] **Step 2: Refactor utils.ts**
  - Add explicit types to functions.
  - Implement type checking for typing checks and focus trapping.
  ```typescript
  export function isUserTyping(e: KeyboardEvent): boolean {
      const target = e.target as HTMLElement;
      return (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
      );
  }

  export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
      let timeout: any;
      return function executedFunction(...args: Parameters<T>) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }

  export function trapFocus(e: KeyboardEvent, modalElement: HTMLElement) {
      if (e.key !== 'Tab') return;
      const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      if (e.shiftKey) {
          if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
          }
      } else {
          if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
          }
      }
  }

  export function customConfirm(message: string): Promise<boolean> {
      return new Promise((resolve) => {
          const modal = document.getElementById('confirm-modal');
          const msgEl = document.getElementById('confirm-message');
          const okBtn = document.getElementById('confirm-ok-btn');
          const cancelBtn = document.getElementById('confirm-cancel-btn');
          if (!modal || !msgEl || !okBtn || !cancelBtn) {
              resolve(window.confirm(message));
              return;
          }
          msgEl.textContent = message;
          modal.classList.remove('hidden');
          const cleanup = () => {
              modal.classList.add('hidden');
              okBtn.removeEventListener('click', onOk);
              cancelBtn.removeEventListener('click', onCancel);
          };
          const onOk = () => { cleanup(); resolve(true); };
          const onCancel = () => { cleanup(); resolve(false); };
          okBtn.addEventListener('click', onOk);
          cancelBtn.addEventListener('click', onCancel);
      });
  }
  ```

- [ ] **Step 3: Refactor audio.ts and stats.ts**
  - Cast audio element sources cleanly.
  - Implement type safety for stats history lookup.

- [ ] **Step 4: Commit**
  ```bash
  git commit -m "refactor: migrate utils, audio, and stats to TypeScript"
  ```

---

### Task 5: Migrate timer.ts, settings.ts and tasks.ts

**Files:**
- Create: `src/js/modules/timer.ts` (via renaming)
- Create: `src/js/modules/settings.ts` (via renaming)
- Create: `src/js/modules/tasks.ts` (via renaming)

- [ ] **Step 1: Rename files**
  Run:
  ```bash
  git mv src/js/modules/timer.js src/js/modules/timer.ts
  git mv src/js/modules/settings.js src/js/modules/settings.ts
  git mv src/js/modules/tasks.js src/js/modules/tasks.ts
  ```

- [ ] **Step 2: Update import paths**
  Remove `.js` suffix from internal imports.

- [ ] **Step 3: Refactor timer.ts**
  Resolve types for timer values, interval instances, SVG geometry properties, and notifications.
  Ensure `progressCircle` properties are safely cast as `SVGCircleElement`.
  ```typescript
  const progressCircle = elements.progressCircle as unknown as SVGCircleElement;
  const radius = progressCircle.r.baseVal.value;
  ```

- [ ] **Step 4: Refactor settings.ts**
  Type-cast setting UI input values safely.

- [ ] **Step 5: Refactor tasks.ts**
  Provide explicit type declarations for `tasks` functions (`addTask`, `toggleTaskComplete`, `setActiveTask`, `renderTasks`).
  Implement proper types for DragEvents.

- [ ] **Step 6: Commit**
  ```bash
  git commit -m "refactor: migrate timer, settings, and tasks to TypeScript"
  ```

---

### Task 6: Migrate firebase.ts, sync.ts and auth.ts

**Files:**
- Create: `src/js/modules/firebase.ts` (via renaming)
- Create: `src/js/modules/sync.ts` (via renaming)
- Create: `src/js/modules/auth.ts` (via renaming)

- [ ] **Step 1: Rename files**
  Run:
  ```bash
  git mv src/js/modules/firebase.js src/js/modules/firebase.ts
  git mv src/js/modules/sync.js src/js/modules/sync.ts
  git mv src/js/modules/auth.js src/js/modules/auth.ts
  ```

- [ ] **Step 2: Update paths and signatures**
  Verify the modular SDK imports are compliant with TypeScript compiler configurations.
  Ensure correct type casting of the Firestore DB instances and Auth parameters.

- [ ] **Step 3: Commit**
  ```bash
  git commit -m "refactor: migrate firebase, sync, and auth to TypeScript"
  ```

---

### Task 7: Migrate app.js and index.html

**Files:**
- Create: `src/js/app.ts` (via renaming)
- Modify: `index.html`

- [ ] **Step 1: Rename app.js**
  Run: `git mv src/js/app.js src/js/app.ts`

- [ ] **Step 2: Refactor app.ts**
  - Update imports of all internal modules to target their `.ts` names (leaving off the extension).
  - Cast `window.lucide` safely:
    ```typescript
    if ((window as any).lucide) (window as any).lucide.createIcons();
    ```

- [ ] **Step 3: Modify index.html script tag**
  Change:
  ```html
  <script src="src/js/app.js" type="module"></script>
  ```
  To:
  ```html
  <script src="src/js/app.ts" type="module"></script>
  ```

- [ ] **Step 4: Commit**
  ```bash
  git commit -m "refactor: migrate main app entry to TypeScript and update script tag"
  ```

---

### Task 8: Refactor pip.js to TypeScript and Implement Memory Cleanup

**Files:**
- Create: `src/js/modules/pip.ts` (via renaming)

- [ ] **Step 1: Rename file**
  Run: `git mv src/js/modules/pip.js src/js/modules/pip.ts`

- [ ] **Step 2: Implement cleanup registry**
  Open `src/js/modules/pip.ts` and add `pipCleanups` registry code.
  Rewrite listeners and observers registrations to store their teardowns:
  ```typescript
  let pipCleanups: Array<() => void> = [];

  function runPipCleanups() {
      pipCleanups.forEach(cleanup => {
          try { cleanup(); } catch (e) { console.error('PiP Cleanup Err:', e); }
      });
      pipCleanups = [];
  }
  ```

  - **Observer registers**:
    ```typescript
    const observer = new MutationObserver(updateUI);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    pipCleanups.push(() => observer.disconnect());

    const taskObserver = new MutationObserver(updateActiveTaskDisplay);
    if (taskList) {
        taskObserver.observe(taskList, { subtree: true, attributes: true, attributeFilter: ['class'] });
        pipCleanups.push(() => taskObserver.disconnect());
    }
    ```

  - **Listeners on window & overlay controls**:
    ```typescript
    const enterHandler = () => overlay.classList.remove('hidden');
    const leaveHandler = () => overlay.classList.add('hidden');
    pipWindow.document.body.addEventListener('mouseenter', enterHandler);
    pipWindow.document.body.addEventListener('mouseleave', leaveHandler);
    pipCleanups.push(() => {
        if (pipWindow) {
            pipWindow.document.body.removeEventListener('mouseenter', enterHandler);
            pipWindow.document.body.removeEventListener('mouseleave', leaveHandler);
        }
    });
    ```

  - **Call `runPipCleanups()` on `pagehide`**:
    ```typescript
    pipWindow.addEventListener('pagehide', () => {
        console.log('PiP: Closing and restoring...');
        runPipCleanups();
        ...
    });
    ```

- [ ] **Step 3: Commit**
  ```bash
  git commit -m "feat: implement pip cleanups and migrate pip.ts to TS"
  ```

---

### Task 9: Final Build Verification

**Files:**
- None

- [ ] **Step 1: Check compile errors**
  Run: `npx tsc --noEmit`
  Expected: Command exits successfully with 0 errors.

- [ ] **Step 2: Build project**
  Run: `npm run build`
  Expected: Project builds cleanly. Output files generated under `dist/`.

- [ ] **Step 3: Commit all remaining changes**
  Run: `git commit -am "chore: finalize typescript migration"`
