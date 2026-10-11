# Task Categories & Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement task categorization/projects with custom colors, category filter bar, category selector when creating tasks, and sync with local storage & cloud.

**Architecture:** Create a dedicated `categories.ts` module adhering to SRP, extend `Task` and `State` types, enhance `tasks.ts` with filtering and badges, update DOM elements in `index.html` and `elements.ts`, and test with TypeScript typecheck and Playwright E2E tests.

**Tech Stack:** TypeScript, HTML5/CSS3, Vite, Playwright.

---

### Task 1: Types and Global State Update

**Files:**
- Modify: `src/js/types/index.ts`
- Modify: `src/js/modules/state.ts`

- [ ] **Step 1: Update type definitions in `src/js/types/index.ts`**

Update `Category`, `Task`, and `State` interfaces:

```typescript
export interface Category {
    id: string;
    name: string;
    color: string;
    isDefault?: boolean;
}

export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actualPomodoros: number;
    isCompleted: boolean;
    isActive: boolean;
    categoryId?: string;
}

export interface State {
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    timeRemaining: number;
    isRunning: boolean;
    timerId: any | null;
    pomodorosCompleted: number;
    tasks: Task[];
    activeTaskId: string | null;
    settings: Settings;
    focusHistory: FocusHistory;
    categories: Category[];
    selectedCategoryFilter: string;
}
```

- [ ] **Step 2: Update initial state in `src/js/modules/state.ts`**

Add `categories: []` and `selectedCategoryFilter: 'all'` to default `state`:

```typescript
export const state: State = {
    mode: 'pomodoro',
    timeRemaining: 25 * 60,
    isRunning: false,
    timerId: null,
    pomodorosCompleted: 0,
    tasks: [],
    activeTaskId: null,
    categories: [],
    selectedCategoryFilter: 'all',
    settings: {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        alarmSound: 'bell',
        tickingSound: 'none',
        volume: 70,
        darkMode: false
    },
    focusHistory: {}
};
```

- [ ] **Step 3: Run typecheck to verify changes**

Run: `npm run typecheck`
Expected: Exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add src/js/types/index.ts src/js/modules/state.ts
git commit -m "feat(types): add Category interface and update State"
```

---

### Task 2: Implement Categories Module (`categories.ts`)

**Files:**
- Create: `src/js/modules/categories.ts`

- [ ] **Step 1: Create `src/js/modules/categories.ts`**

Implement CRUD operations, default categories, color swatches, filter state, and rendering helper functions:

```typescript
import { state, notifyStateChange } from './state';
import { elements } from './elements';
import { Category } from '../types/index';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat_work', name: 'Work', color: '#4F46E5', isDefault: true },
    { id: 'cat_study', name: 'Study', color: '#06B6D4', isDefault: true },
    { id: 'cat_personal', name: 'Personal', color: '#10B981', isDefault: true },
    { id: 'cat_general', name: 'General', color: '#6B7280', isDefault: true }
];

export const CATEGORY_COLORS = [
    '#4F46E5', // Indigo
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#F43F5E', // Rose
    '#8B5CF6', // Purple
    '#6B7280', // Gray
    '#2563EB'  // Blue
];

export const categoryEvents = {
    onCategoryChanged: () => { }
};

export function loadCategories(): void {
    const saved = localStorage.getItem('pomodoro_categories');
    if (saved) {
        try {
            state.categories = JSON.parse(saved);
        } catch (e) {
            state.categories = [...DEFAULT_CATEGORIES];
        }
    } else {
        state.categories = [...DEFAULT_CATEGORIES];
    }
    renderCategoryFilters();
    renderCategoryOptions();
}

export function saveCategories(): void {
    localStorage.setItem('pomodoro_categories', JSON.stringify(state.categories));
}

export function getCategoryById(id?: string): Category {
    if (!id) return state.categories.find(c => c.id === 'cat_general') || DEFAULT_CATEGORIES[3];
    return state.categories.find(c => c.id === id) || state.categories.find(c => c.id === 'cat_general') || DEFAULT_CATEGORIES[3];
}

export function addCategory(name: string, color: string): Category | null {
    const trimmed = name.trim().substring(0, 30);
    if (!trimmed) return null;

    const exists = state.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return null;

    const newCategory: Category = {
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: trimmed,
        color: color || '#6B7280'
    };

    state.categories.push(newCategory);
    saveCategories();
    renderCategoryFilters();
    renderCategoryOptions();
    notifyStateChange();
    categoryEvents.onCategoryChanged();
    return newCategory;
}

export function deleteCategory(id: string): boolean {
    const cat = state.categories.find(c => c.id === id);
    if (!cat || cat.isDefault) return false;

    // Reassign tasks to general
    state.tasks.forEach(task => {
        if (task.categoryId === id) {
            task.categoryId = 'cat_general';
        }
    });

    state.categories = state.categories.filter(c => c.id !== id);
    if (state.selectedCategoryFilter === id) {
        state.selectedCategoryFilter = 'all';
    }

    saveCategories();
    renderCategoryFilters();
    renderCategoryOptions();
    notifyStateChange();
    categoryEvents.onCategoryChanged();
    return true;
}

export function setCategoryFilter(id: string): void {
    state.selectedCategoryFilter = id;
    renderCategoryFilters();
    categoryEvents.onCategoryChanged();
}

export function renderCategoryFilters(): void {
    if (!elements.categoryFiltersContainer) return;
    elements.categoryFiltersContainer.innerHTML = '';

    // 'All' button
    const allBtn = document.createElement('button');
    allBtn.className = `category-filter-btn ${state.selectedCategoryFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All';
    allBtn.onclick = () => setCategoryFilter('all');
    elements.categoryFiltersContainer.appendChild(allBtn);

    // Specific category buttons
    state.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-filter-btn ${state.selectedCategoryFilter === cat.id ? 'active' : ''}`;
        btn.innerHTML = `<span class="category-dot" style="background-color: ${cat.color}"></span><span>${cat.name}</span>`;
        btn.onclick = () => setCategoryFilter(cat.id);
        elements.categoryFiltersContainer.appendChild(btn);
    });

    // Add category button
    const addBtn = document.createElement('button');
    addBtn.className = 'category-filter-add-btn';
    addBtn.title = 'Add Category';
    addBtn.innerHTML = '+';
    addBtn.onclick = () => {
        if (elements.categoryModal) elements.categoryModal.classList.remove('hidden');
    };
    elements.categoryFiltersContainer.appendChild(addBtn);
}

export function renderCategoryOptions(): void {
    if (!elements.taskCategorySelect) return;
    elements.taskCategorySelect.innerHTML = '';

    state.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        if (cat.id === (state.selectedCategoryFilter !== 'all' ? state.selectedCategoryFilter : 'cat_general')) {
            opt.selected = true;
        }
        elements.taskCategorySelect.appendChild(opt);
    });
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: Exits with code 0 (or note elements missing if not yet added in elements.ts).

- [ ] **Step 3: Commit**

```bash
git add src/js/modules/categories.ts
git commit -m "feat(categories): implement categories module with CRUD and rendering"
```

---

### Task 3: DOM Elements & HTML/CSS Integration

**Files:**
- Modify: `index.html`
- Modify: `src/js/modules/elements.ts`
- Modify: `src/css/modules/tasks.css`

- [ ] **Step 1: Update `index.html`**

1. Add the category filter bar directly above `#task-list`.
2. Add `<select id="task-category-select">` inside the task addition form container.
3. Add the Category Modal `<div id="category-modal" class="modal hidden">` before closing body.

- [ ] **Step 2: Update `src/js/modules/elements.ts`**

Export the new DOM elements:
- `categoryFiltersContainer` (`#category-filters`)
- `taskCategorySelect` (`#task-category-select`)
- `categoryModal` (`#category-modal`)
- `categoryNameInput` (`#category-name-input`)
- `categoryColorOptions` (`#category-color-options`)
- `categorySaveBtn` (`#category-save-btn`)
- `categoryCloseBtn` (`#category-close-btn`)

- [ ] **Step 3: Update `src/css/modules/tasks.css`**

Add CSS rules for:
- `.category-filters` container (flex, horizontal scroll, scrollbar styling)
- `.category-filter-btn` and `.category-filter-btn.active`
- `.category-dot`
- `.category-filter-add-btn`
- `.task-category-badge`
- Category modal swatch selectors `.color-swatch.selected`

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: Exits with code 0.

- [ ] **Step 5: Commit**

```bash
git add index.html src/js/modules/elements.ts src/css/modules/tasks.css
git commit -m "feat(ui): add category filters, modal and styling"
```

---

### Task 4: Integrate Categories with `tasks.ts` and `app.ts`

**Files:**
- Modify: `src/js/modules/tasks.ts`
- Modify: `src/js/app.ts`

- [ ] **Step 1: Update `addTask()` and `renderTasks()` in `src/js/modules/tasks.ts`**

- In `addTask`:
  - Accept `categoryId?: string`.
  - Save `categoryId` to `newTask` (fallback to `elements.taskCategorySelect.value` or `'cat_general'`).
- In `renderTasks`:
  - Filter tasks:
    ```typescript
    const filteredTasks = state.selectedCategoryFilter === 'all'
        ? state.tasks
        : state.tasks.filter(t => (t.categoryId || 'cat_general') === state.selectedCategoryFilter);
    ```
  - For each rendered task, lookup category via `getCategoryById(task.categoryId)` and render a category badge with matching color dot and name.
- Listen to `categoryEvents.onCategoryChanged = () => { renderTasks(); };`

- [ ] **Step 2: Initialize categories in `src/js/app.ts`**

- Call `loadCategories()` on app startup.
- Setup modal event listeners for creating new category, choosing color swatch, and closing modal.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: Exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add src/js/modules/tasks.ts src/js/app.ts
git commit -m "feat(tasks): wire category assignment, badge rendering and filter"
```

---

### Task 5: Integrate Cloud Sync in `sync.ts`

**Files:**
- Modify: `src/js/modules/sync.ts`

- [ ] **Step 1: Include `categories` in `sync.ts`**

- When packing sync payload to Firestore, include `categories: state.categories`.
- When restoring from Firestore, if `data.categories` exists, assign to `state.categories`, call `saveCategories()` and `renderCategoryFilters()`.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: Exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/js/modules/sync.ts
git commit -m "feat(sync): sync categories with Firestore"
```

---

### Task 6: Playwright E2E Tests & Final Verification

**Files:**
- Modify: `tests/features.spec.js`

- [ ] **Step 1: Add E2E tests for Category Management**

In `tests/features.spec.js`, add test cases:
1. `creates task with category and shows category badge`
2. `filters task list when clicking category filter pills`
3. `adds a new custom category through category modal`

- [ ] **Step 2: Run Playwright test suite**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 3: Verify with GitNexus detect changes**

Run: `npx gitnexus analyze` (if applicable)

- [ ] **Step 4: Commit**

```bash
git add tests/features.spec.js
git commit -m "test: add E2E tests for task categories and filtering"
```
