# Task Categories & Projects Design Specification

## 1. Overview
This specification details the design and architecture for adding **Task Categories & Projects** to the Pomodoro PWA application. Users will be able to organize tasks into distinct categories/projects (e.g., Work, Study, Personal, General), assign preset or custom colors, filter tasks using a horizontal pill bar, and sync category configurations with local storage and Firestore.

---

## 2. Data Architecture & Types

File: `src/js/types/index.ts`

```typescript
export interface Category {
    id: string;
    name: string;
    color: string; // Hex color code (e.g., '#4F46E5')
    isDefault?: boolean;
}

export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actualPomodoros: number;
    isCompleted: boolean;
    isActive: boolean;
    categoryId?: string; // Associated category ID (defaults to 'cat_general')
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
    selectedCategoryFilter: string; // 'all' or category ID
}
```

---

## 3. Module Architecture & Responsibilities

### 3.1 `src/js/modules/categories.ts` (New Module)
- **Default Categories**:
  - `Work` (`#4F46E5`, id: `'cat_work'`)
  - `Study` (`#06B6D4`, id: `'cat_study'`)
  - `Personal` (`#10B981`, id: `'cat_personal'`)
  - `General` (`#6B7280`, id: `'cat_general'`, default for unclassified tasks)
- **Color Presets**: 8 curated colors:
  - Indigo (`#4F46E5`), Cyan (`#06B6D4`), Emerald (`#10B981`), Amber (`#F59E0B`), Rose (`#F43F5E`), Purple (`#8B5CF6`), Gray (`#6B7280`), Blue (`#2563EB`).
- **Core Functions**:
  - `loadCategories(): void`: Loads categories from `localStorage.getItem('pomodoro_categories')` or initializes with default categories.
  - `saveCategories(): void`: Persists categories to `localStorage`.
  - `addCategory(name: string, color: string): Category`: Validates name (max 30 chars, non-empty, non-duplicate), generates UUID, appends to state and triggers re-render.
  - `deleteCategory(id: string): void`: Removes category (cannot delete if it is default general), re-assigns any existing tasks referencing this category to `'cat_general'`.
  - `getCategoryById(id: string | undefined): Category`: Returns matched category or `'cat_general'` fallback.
  - `setCategoryFilter(id: string): void`: Sets `state.selectedCategoryFilter` and triggers task list re-render.
  - `renderCategoryFilters(): void`: Renders pill buttons in the filter bar container.
  - `renderCategoryOptions(selectElement: HTMLSelectElement): void`: Populates category select options in task creation/editing form.

### 3.2 `src/js/modules/tasks.ts` (Modifications)
- Update `addTask(title: string, estPomodoros: string | number, categoryId?: string)`: Sets `categoryId` (fallback to selected category filter if active and not `'all'`, else `'cat_general'`).
- Update `renderTasks()`:
  - Filter `state.tasks` by `t.categoryId === state.selectedCategoryFilter` when `state.selectedCategoryFilter !== 'all'`.
  - Render category badge (small pill with category dot/background color) on task item card.

### 3.3 `src/js/modules/sync.ts` & `src/js/modules/state.ts` (State & Cloud Sync)
- `state.ts`: Initialize `categories: []` and `selectedCategoryFilter: 'all'`.
- `sync.ts`: Include `categories` in Firestore cloud backup and restore payload when user is authenticated.

### 3.4 UI & Styling (`index.html`, `src/css/modules/tasks.css`)
- **Category Filter Pill Bar**:
  - Placed directly above the task list.
  - Horizontally scrollable on mobile screens with smooth scroll.
  - Active pill highlighted with theme accent.
  - Includes a `+` button to open the "New Category" modal.
- **New Category Modal**:
  - Input for category name.
  - Color palette selection (radio/swatch buttons).
  - "Create Category" button.
- **Task Creation Form**:
  - Category selector dropdown placed adjacent to the Pomodoro estimate input.

---

## 4. Edge Cases & Error Handling
1. **Backward Compatibility**: Existing tasks saved in LocalStorage without `categoryId` are dynamically assigned `'cat_general'`.
2. **Category Deletion Safety**: If a category is deleted, all tasks linked to it are reassigned to `'cat_general'` before deletion.
3. **Validation**: Category names are trimmed, max 30 characters, must not be duplicate (case-insensitive).
4. **Theme Compatibility**: Preset colors are chosen to maintain clear contrast and visibility in both Light Mode and Dark Mode.

---

## 5. Verification & Testing Strategy
1. **Unit / Component Testing**:
   - `categories.ts`: Test loading defaults, adding new category, duplicate rejection, deleting category with task reassignment.
   - `tasks.ts`: Test adding task with category, filtering tasks by category, and rendering badges.
2. **Playwright E2E Testing**:
   - Create a task with a category, click pill filter, verify only matching tasks appear.
   - Switch back to 'All' filter, verify all tasks reappear.
