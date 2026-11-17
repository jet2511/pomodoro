# FocusTimer Pro — Project Remediation Design Spec

**Date:** 2026-11-17
**Status:** Approved
**Scope:** Unified remediation across Core State/Sync/Timer/PiP, Security/PWA/Offline Assets, UI English Normalization/Cleanup, and Testing/Linting/CI.

---

## 1. Goals & Constraints
- Fix all confirmed runtime/logic bugs in task management, Firestore sync, timer auto-start, confirm modal, and Picture-in-Picture (PiP).
- Harden security (XSS via category color, Firestore rules, remove unpinned CDN scripts/importmap).
- Enable reliable offline PWA behavior (bundled `lucide` icons, `favicon.ico`, Web Audio API fallback for Mixkit audio).
- Normalize all UI copy to English and remove dead code/files.
- Restore and automate quality gates: Vitest unit tests, Playwright E2E tests, ESLint/TypeScript, and GitHub Actions CI.
- Maintain backward compatibility with existing `localStorage` and Firestore user documents that lack `updatedAt` / `deletedAt`.

---

## 2. Architecture & Design

### 2.1. Core State, Tasks, Sync, Timer & PiP
- **Schema (`src/js/types/index.ts`)**:
  - Add `updatedAt?: number` and `deletedAt?: number` to `Task` and `Category`.
  - Treat missing `updatedAt` as `0` during merge.
- **Task Active State (`src/js/modules/tasks.ts`)**:
  - `addTask`: determine `isFirstTask` using `!state.tasks.some(t => !t.isArchived && !t.isCompleted && !t.deletedAt)`.
  - `archiveTask` & `deletePermanently`: always set `task.isActive = false` when archiving or deleting; set `deletedAt = Date.now()` and `updatedAt = Date.now()` on `deletePermanently` instead of hard-splicing immediately (prune tombstones older than 30 days on save).
  - `restoreTask`: set `isArchived = false`, `updatedAt = Date.now()`, and keep `isActive = false` so it never conflicts with `state.activeTaskId`.
  - All task getters/renderers filter out `t.deletedAt`.
- **Categories (`src/js/modules/categories.ts`)**:
  - `addCategory` sets `updatedAt = Date.now()`.
  - `deleteCategory` sets `deletedAt = Date.now()` and `updatedAt = Date.now()` for non-default categories; `DEFAULT_CATEGORIES` remain undeletable.
  - All category renderers/pickers filter out `c.deletedAt`.
- **Firestore Sync & Logout (`src/js/modules/sync.ts`, `src/js/modules/firebase.ts`, `src/js/modules/auth.ts`, `src/js/modules/state.ts`)**:
  - Split `initFirebaseAuth()` (`firebase/app` + `firebase/auth`) from `initFirestore()` (`firebase/firestore`), calling `initFirestore()` only inside `onAuthStateChanged` when `user !== null`.
  - Wrap `onSnapshot` merge in `try { ... } finally { isLoadingFromCloud = false; }`.
  - Track `hasPendingLocalChanges`: set `true` in `notifyStateChange()`, clear after `syncDataToCloud()` succeeds.
  - Merge `tasks` and `categories` by `id` using Last-Write-Wins (`updatedAt`), preserving local items with newer `updatedAt` when `hasPendingLocalChanges` is `true`.
  - On logout (`showLoggedOutView(true)`): call `stopTimer(false)` if running, clear `autoStartTimeoutId`, reset `state.pomodorosCompleted = 0`, call `resetLocalState()`, and refresh `updateDisplay()` + `updateActiveTaskDisplay()`.
- **Timer & Confirm Modal (`src/js/modules/timer.ts`, `src/js/modules/utils.ts`)**:
  - Store `autoStartTimeoutId` in `timer.ts` and clear it in `stopTimer()` and `setMode()`.
  - In `customConfirm()`: if a previous confirm dialog is still open, resolve its promise with `false` and clean up listeners before opening the new one; restore `document.activeElement` focus on close.
- **Picture-in-Picture (`src/js/modules/pip.ts`)**:
  - Sync `data-theme="light"` on `pipWindow.document.documentElement` when opening PiP and inside `updateUI()`.
  - Update `pipStyle` to use `color: var(--clr-text) !important;` and add `:root[data-theme="light"]` overrides for `.progress-ring__circle` and `#current-task-display`.
  - `await toggleTimer()` and `await skipPhase()` in `keydownHandler` before calling `updateUI()` and `showActionFeedback()`.
  - Expand `taskObserver` to `{ childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }`.

### 2.2. Security, PWA & Offline Assets
- **Color Sanitization (`src/js/modules/utils.ts`)**:
  - Add `sanitizeHexColor(color: string, fallback = '#6B7280'): string` matching `/^#[0-9a-fA-F]{6}$/` and apply it everywhere `cat.color` is rendered.
- **Local Icons & PWA (`index.html`, `vite.config.mjs`, `public/favicon.ico`)**:
  - Install `lucide` via npm; create `src/js/modules/icons.ts` exporting `refreshIcons()` using tree-shaken `createIcons({ icons: { ... } })`.
  - Remove `<script src="https://unpkg.com/lucide@latest">` and `<script type="importmap">` from `index.html`.
  - Fix `apple-touch-icon` to `icons/icon-192.png`.
  - Add `public/favicon.ico` and remove `'audio/*.mp3'` from `VitePWA.includeAssets` in `vite.config.mjs`.
- **Hybrid Audio (`src/js/modules/audio.ts`, `index.html`)**:
  - Use `data-src` consistently for all `<audio>` elements (`bell`, `bird`, `digital`, `tick`, `rain`).
  - On `play()` failure or offline/error, fall back to a Web Audio API synthesizer (`AudioContext`) supporting alarm tones (`bell`, `bird`, `digital`) and ambient loops (`tick`, `rain`) scaled by `state.settings.volume`.
- **Firestore Rules (`firestore.rules`)**:
  - Enforce allowed top-level keys (`tasks`, `categories`, `settings`, `focusHistory`, `lastSynced`), types (`list` / `map`), and collection size caps (`tasks.size() <= 500`, `categories.size() <= 50`).

### 2.3. UI English Normalization & Cleanup
- Translate all Vietnamese UI strings in `index.html`, `src/js/modules/tasks.ts`, `src/js/app.ts`, and `src/js/modules/utils.ts` to English.
- Replace `window.alert(...)` in `src/js/app.ts` (`initCategoryModal`) with an inline error element inside `#category-modal`.
- Remove `pip_test.cjs`, dead `#task-list` action handlers (`restore`, `delete-permanent`, `delete`) in `src/js/app.ts`, and unused CSS classes (`.archived-filter-btn`, `.task-item.archived`, `.dev-badge`, `.sync-note`).
- Update `README.md` to match actual PiP dimensions (`240x240`), dev URL (`http://localhost:5173/pomodoro/`), shortcut `T` (focuses `#task-input`), shortcut `C` (Settings), and remove the broken image link.

### 2.4. Testing, Linting & CI
- **Vitest**: Install `vitest` and `jsdom`; add `vitest.config.ts` and `"test:unit": "vitest run"`. Replace `tests/sync.spec.js` with `tests/unit/sync.test.ts`, `tests/unit/tasks.test.ts`, and `tests/unit/state.test.ts`.
- **Playwright**: Update `tests/features.spec.js` archive empty-state assertion to English and add E2E coverage for Light Mode PiP, `addTask` after archiving all tasks, and inline category error.
- **ESLint**: Install `eslint` + `typescript-eslint` (or compatible TS config) and add `"lint": "eslint src"` to `package.json`.
- **CI (`.github/workflows/deploy.yml`)**: Run `npm run typecheck`, `npm run lint`, `npm run test:unit`, and Playwright E2E before `npm run build` and deploy.
