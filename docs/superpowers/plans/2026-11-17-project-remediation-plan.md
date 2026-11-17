# FocusTimer Pro — Project Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all identified logic, sync, PiP, security, offline PWA, cleanup, and test/CI gaps in FocusTimer Pro.

**Architecture:** Modular incremental remediation across four self-contained workstreams: (1) Core State/Sync/Timer/PiP fixes with `updatedAt`/`deletedAt` LWW merge, (2) Security & Offline PWA (hex color sanitization, tree-shaken `lucide`, Web Audio API fallback, `firestore.rules`), (3) English UI & dead-code cleanup, and (4) Vitest + ESLint + Playwright + GitHub Actions CI.

**Tech Stack:** TypeScript 7, Vite 7, Firebase 12 (lazy-loaded Auth & Firestore), Lucide, Vitest + jsdom, Playwright, ESLint.

---

### Task 1: Update Types, Sanitization & Confirm Modal (`types/index.ts`, `utils.ts`)

**Files:**
- Modify: `src/js/types/index.ts`
- Modify: `src/js/modules/utils.ts`

- [ ] **Step 1: Add `updatedAt` and `deletedAt` to `Category` and `Task` in `src/js/types/index.ts`**

```ts
export interface Category {
    id: string;
    name: string;
    color: string;
    isDefault?: boolean;
    updatedAt?: number;
    deletedAt?: number;
}

export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actualPomodoros: number;
    isCompleted: boolean;
    isActive: boolean;
    categoryId?: string;
    isArchived?: boolean;
    archivedAt?: number;
    updatedAt?: number;
    deletedAt?: number;
}
```

- [ ] **Step 2: Add `sanitizeHexColor`, normalize `customConfirm` to English, and guard overlapping calls in `src/js/modules/utils.ts`**

```ts
export function sanitizeHexColor(color: string | undefined, fallback: string = '#6B7280'): string {
    if (!color) return fallback;
    return /^#[0-9a-fA-F]{6}$/.test(color.trim()) ? color.trim() : fallback;
}
```

Update `customConfirm` in `src/js/modules/utils.ts`:
- Store module-level `activeConfirmCleanup: (() => void) | null = null`. If `activeConfirmCleanup` exists when `customConfirm` is called, invoke it first so the previous promise resolves `false` and listeners are removed.
- Save `previouslyFocused = document.activeElement as HTMLElement | null` and restore focus in `cleanup()`.
- Change default English labels:
  - `isDanger`: `/delete|remove|clear|cannot be undone/i.test(message)`
  - `title`: `isDanger ? 'Confirm Delete' : 'Confirm Action'`
  - `confirmText`: `isDanger ? 'Delete' : 'Confirm'`
  - `cancelText`: `'Cancel'`

- [ ] **Step 3: Run typecheck**
Run: `npm.cmd run typecheck`
Expected: PASS (0 errors).

---

### Task 2: Fix Task & Category State Management (`tasks.ts`, `categories.ts`)

**Files:**
- Modify: `src/js/modules/tasks.ts`
- Modify: `src/js/modules/categories.ts`

- [ ] **Step 1: Update `src/js/modules/tasks.ts`**
- Filter `!t.deletedAt` in `getFirstIncompleteTask`, `loadTasks`, `updateArchiveBadgeCount`, `renderArchiveModal`, and `renderTasks`.
- In `saveTasks()`: prune tombstones where `t.deletedAt && Date.now() - t.deletedAt > 30 * 24 * 60 * 60 * 1000`.
- In `addTask()`:
  - `const isFirstTask = !state.tasks.some(t => !t.isArchived && !t.isCompleted && !t.deletedAt);`
  - Set `updatedAt: Date.now()` on `newTask`.
- In `toggleTaskComplete()`, `setActiveTask()`, `updateTaskCategory()`, `updateTaskPomodoros()`: set `task.updatedAt = Date.now()`.
- In `archiveTask()`: set `task.isActive = false`, `task.isArchived = true`, `task.archivedAt = Date.now()`, `task.updatedAt = Date.now()`.
- In `restoreTask()`: set `task.isArchived = false`, `task.isActive = false`, `task.updatedAt = Date.now()`.
- In `deletePermanently(id)`: set `task.deletedAt = Date.now()`, `task.updatedAt = Date.now()`, `task.isActive = false`; if `state.activeTaskId === id`, set `state.activeTaskId = null`.
- In `emptyArchivedTasks()`: mark all `t.isArchived && !t.deletedAt` with `t.deletedAt = Date.now()`, `t.updatedAt = Date.now()`, `t.isActive = false`.
- Use `sanitizeHexColor(cat.color)` wherever `cat.color` is rendered, and translate empty/title strings to English (`'No matching archived tasks found.'`, `'No archived tasks yet.'`, `'Archive task'`, `'Restore to task list'`, `'Delete permanently'`).

- [ ] **Step 2: Update `src/js/modules/categories.ts`**
- Filter `!c.deletedAt` in `getCategoryById`, `renderCategoryFilters`, `renderCategoryOptions`, and duplicate name check in `addCategory`.
- Set `updatedAt: Date.now()` in `addCategory`.
- In `deleteCategory(id)`: set `cat.deletedAt = Date.now()` and `cat.updatedAt = Date.now()` instead of removing from array; reassign affected tasks' `categoryId = 'cat_general'` and `task.updatedAt = Date.now()`.
- Use `sanitizeHexColor(cat.color)` in `renderCategoryFilters`.

- [ ] **Step 3: Run typecheck**
Run: `npm.cmd run typecheck`
Expected: PASS.

---

### Task 3: Harden Firestore Lazy-Loading, Sync & Logout (`firebase.ts`, `sync.ts`, `auth.ts`, `state.ts`)

**Files:**
- Modify: `src/js/modules/firebase.ts`
- Modify: `src/js/modules/sync.ts`
- Modify: `src/js/modules/auth.ts`
- Modify: `src/js/modules/state.ts`

- [ ] **Step 1: Split Auth & Firestore initialization in `src/js/modules/firebase.ts`**
- Add `initFirebaseAuth()` (imports `firebase/app` + `firebase/auth` only) and `initFirestore()` (imports `firebase/firestore` only when called). Keep `initFirebase()` as a wrapper calling both for backward compatibility if needed.

- [ ] **Step 2: Fix `sync.ts` (`try/finally`, pending flag, LWW merge)**
- Export `markLocalChangesPending()` / `hasPendingLocalChanges` flag.
- In `setupRealtimeSync(user)`: call `await initFirestore()` first.
- In `onSnapshot`:
  - Wrap merge logic in `try { ... } finally { isLoadingFromCloud = false; }`.
  - Implement `mergeByUpdatedAt<T extends { id: string; updatedAt?: number }>(localItems: T[], cloudItems: T[]): T[]` so whichever item has the higher `updatedAt ?? 0` wins; if `hasPendingLocalChanges` is `true`, prefer local items on equal/newer timestamps.
  - Apply `mergeByUpdatedAt` to both `tasks` and `categories`.

- [ ] **Step 3: Fix logout cleanup in `src/js/modules/auth.ts` & `src/js/modules/state.ts`**
- In `state.ts`: `resetLocalState()` also resets `state.pomodorosCompleted = 0`.
- In `auth.ts`:
  - `initAuth()` calls `initFirebaseAuth()` instead of `initFirebase()`.
  - Inside `onAuthStateChanged`, when `user` is truthy, call `await setupRealtimeSync(user)`.
  - Inside `showLoggedOutView(true)`, call `stopTimer(false)` (exported from `timer.ts`), `resetLocalState()`, `loadCategories()`, `renderTasks()`, `updateStatsUI()`, `applySettingsToUI()`, `updateDisplay()`, `updateActiveTaskDisplay()`.

- [ ] **Step 4: Run typecheck**
Run: `npm.cmd run typecheck`
Expected: PASS.

---

### Task 4: Fix Timer Auto-Start & PiP Light Mode / Async Shortcuts (`timer.ts`, `pip.ts`)

**Files:**
- Modify: `src/js/modules/timer.ts`
- Modify: `src/js/modules/pip.ts`

- [ ] **Step 1: Export `stopTimer` and clear `autoStartTimeoutId` in `src/js/modules/timer.ts`**
- Add `let autoStartTimeoutId: ReturnType<typeof setTimeout> | null = null;`.
- Clear `autoStartTimeoutId` in `stopTimer()` and `setMode()`.
- Store `autoStartTimeoutId = setTimeout(startTimer, 1000)` in `handleTimerComplete()`.
- Change `showNotification` icon from `'favicon.ico'` to `'icons/icon-192.png'`.

- [ ] **Step 2: Fix Light Mode & async shortcuts in `src/js/modules/pip.ts`**
- Sync `data-theme="light"` on `pipWindow.document.documentElement` when opening PiP and inside `updateUI()` based on `state.settings.darkMode`.
- In `pipStyle.textContent`, replace `color: white !important;` on `body.pip-body` with `color: var(--clr-text) !important;`, and add `:root[data-theme="light"] .progress-ring__circle { stroke: #333 !important; }` and `:root[data-theme="light"] #current-task-display { color: #333 !important; background: rgba(0, 0, 0, 0.08) !important; }`.
- Make `keydownHandler` `async` and `await toggleTimer()` / `await skipPhase()` before calling `updateUI()` and `showActionFeedback()`.
- Update `taskObserver.observe(taskList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })`.

- [ ] **Step 3: Run typecheck**
Run: `npm.cmd run typecheck`
Expected: PASS.

---

### Task 5: Offline PWA, Tree-Shaken Lucide, Web Audio Fallback & Security (`index.html`, `vite.config.mjs`, `audio.ts`, `icons.ts`, `firestore.rules`)

**Files:**
- Create: `src/js/modules/icons.ts`
- Create: `public/favicon.ico`
- Modify: `package.json` (install `lucide`)
- Modify: `index.html`
- Modify: `vite.config.mjs`
- Modify: `src/js/modules/audio.ts`
- Modify: `src/js/app.ts`
- Modify: `src/js/modules/auth.ts`
- Modify: `firestore.rules`

- [ ] **Step 1: Install `lucide` and create `src/js/modules/icons.ts`**
Run: `npm.cmd install lucide`
Create `src/js/modules/icons.ts`:
```ts
import {
    createIcons,
    Clock,
    PictureInPicture,
    User,
    Settings,
    SkipForward,
    Hourglass,
    Plus,
    X,
    Bot,
    Volume2,
    Palette,
    CloudUpload,
} from 'lucide';

export function refreshIcons(): void {
    createIcons({
        icons: {
            Clock,
            PictureInPicture,
            User,
            Settings,
            SkipForward,
            Hourglass,
            Plus,
            X,
            Bot,
            Volume2,
            Palette,
            CloudUpload,
        },
    });
}
```
Replace `(window as any).lucide.createIcons()` in `app.ts` and `auth.ts` with `refreshIcons()`.

- [ ] **Step 2: Clean up `index.html` & `vite.config.mjs` & add `public/favicon.ico`**
- In `index.html`:
  - Fix `<link rel="apple-touch-icon" href="icons/icon-192.png">`.
  - Add `<link rel="icon" href="favicon.ico">`.
  - Change `#tick-sound` and `#rain-sound` from `src="..."` to `data-src="..." preload="none"`.
  - Remove `<script src="https://unpkg.com/lucide@latest"></script>` and `<script type="importmap">...</script>`.
- In `vite.config.mjs`: change `includeAssets` to `['favicon.ico', 'icons/*.png']`.
- Generate a minimal valid `public/favicon.ico`.

- [ ] **Step 3: Add Web Audio API fallback in `src/js/modules/audio.ts`**
- Implement `playFallbackAlarm(type: 'bell' | 'bird' | 'digital', volume: number)` and `startFallbackAmbient(type: 'tick' | 'rain', volume: number)` / `stopFallbackAmbient()` using `AudioContext`.
- In `playAlarm()` and `toggleBackgroundSound()`, catch `sound.play()` rejections (or offline state) and invoke the Web Audio API fallback automatically.

- [ ] **Step 4: Harden `firestore.rules`**
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.keys().hasOnly(['tasks', 'categories', 'settings', 'focusHistory', 'lastSynced'])
        && (!('tasks' in request.resource.data) || (request.resource.data.tasks is list && request.resource.data.tasks.size() <= 500))
        && (!('categories' in request.resource.data) || (request.resource.data.categories is list && request.resource.data.categories.size() <= 50))
        && (!('settings' in request.resource.data) || request.resource.data.settings is map)
        && (!('focusHistory' in request.resource.data) || request.resource.data.focusHistory is map);
    }
  }
}
```

- [ ] **Step 5: Run typecheck & build**
Run: `npm.cmd run typecheck; npm.cmd run build`
Expected: PASS with smaller main/initial bundle and zero Workbox missing-asset warnings.

---

### Task 6: English UI Normalization, Inline Category Error & Dead-Code Cleanup

**Files:**
- Modify: `index.html`
- Modify: `src/js/app.ts`
- Modify: `src/css/modules/tasks.css`
- Modify: `src/css/modules/auth.css`
- Modify: `README.md`
- Delete: `pip_test.cjs`

- [ ] **Step 1: Translate remaining Vietnamese UI strings in `index.html` & `src/js/app.ts`**
- `index.html`: `"Kho lưu trữ"` -> `"Archive"`, `"Kho lưu trữ công việc"` -> `"Archived Tasks"`, `"Dọn sạch"` -> `"Clear All"`, `"Tìm kiếm công việc đã lưu..."` -> `"Search archived tasks..."`, `"Xác nhận thao tác"` -> `"Confirm Action"`, `"Hủy bỏ"` -> `"Cancel"`, `"Xác nhận"` -> `"Confirm"`.
- `app.ts`: translate `archiveEmptyBtn` and `deletePermBtn` confirm messages to English.

- [ ] **Step 2: Replace `alert(...)` in `app.ts` (`initCategoryModal`) with inline error message**
- Add `<div id="category-error-msg" class="auth-error" style="display:none;"></div>` inside `#category-modal` and display validation errors inline instead of calling `window.alert`.

- [ ] **Step 3: Remove dead code & update `README.md`**
- Delete `pip_test.cjs`.
- Remove unused `restore`, `delete-permanent`, and `delete` handlers from `elements.taskList` listener in `src/js/app.ts`.
- Remove unused `.archived-filter-btn`, `.task-item.archived` from `src/css/modules/tasks.css` and `.dev-badge`, `.sync-note` from `src/css/modules/auth.css`.
- Update `README.md`: remove broken `.system_generated/...` image, update PiP size to `240x240`, update local URL to `http://localhost:5173/pomodoro/`, and fix shortcut `T` description (`Focus Add Task input`).

---

### Task 7: Unit Tests (Vitest), ESLint, Playwright E2E & CI Gates

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/unit/sync.test.ts`
- Create: `tests/unit/tasks.test.ts`
- Create: `tests/unit/state.test.ts`
- Delete: `tests/sync.spec.js`
- Modify: `tests/features.spec.js`
- Modify: `package.json`
- Modify: `.eslintrc.json`
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Install Vitest, jsdom, and ESLint**
Run: `npm.cmd install -D vitest jsdom eslint typescript-eslint`
Add scripts to `package.json`: `"test:unit": "vitest run"`, `"lint": "eslint src"`.

- [ ] **Step 2: Write unit tests (`tests/unit/sync.test.ts`, `tests/unit/tasks.test.ts`, `tests/unit/state.test.ts`) and delete `tests/sync.spec.js`**
- Test LWW merge, tombstone preservation, `isLoadingFromCloud` recovery on error, `addTask` after archiving all tasks, `archiveTask`/`restoreTask` `isActive` behavior, and `sanitizeHexColor`.
- Run: `npm.cmd run test:unit`
Expected: PASS.

- [ ] **Step 3: Update `tests/features.spec.js` and verify Playwright E2E**
- Update line 272 assertion to `'No archived tasks yet.'`.
- Add E2E tests for: `addTask` after archiving all tasks, inline category duplicate error, and Light Mode PiP theme sync.
- Run: `npx.cmd playwright install chromium; npm.cmd test`
Expected: PASS.

- [ ] **Step 4: Add CI gates to `.github/workflows/deploy.yml`**
- Before `npm run build`, add steps for `npm run typecheck`, `npm run lint`, `npm run test:unit`, and `npx playwright install --with-deps chromium && npm test`.
