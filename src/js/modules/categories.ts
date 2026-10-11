import { state, notifyStateChange } from './state';
import { elements } from './elements';
import { Category } from '../types/index';
import { escapeHtml } from './utils';

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
    if (!state.categories || state.categories.length === 0) {
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
    if (!state.categories || state.categories.length === 0) {
        state.categories = [...DEFAULT_CATEGORIES];
    }
    elements.categoryFiltersContainer.innerHTML = '';

    // 'All' button
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `category-filter-btn ${state.selectedCategoryFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All';
    allBtn.onclick = () => setCategoryFilter('all');
    elements.categoryFiltersContainer.appendChild(allBtn);

    // Specific category buttons
    state.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `category-filter-btn ${state.selectedCategoryFilter === cat.id ? 'active' : ''}`;
        btn.setAttribute('data-category-id', cat.id);
        const safeName = escapeHtml(cat.name);
        btn.innerHTML = `<span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeName}</span>`;
        btn.onclick = () => setCategoryFilter(cat.id);
        elements.categoryFiltersContainer.appendChild(btn);
    });

    // Add category button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'category-filter-add-btn';
    addBtn.title = 'Add Category';
    addBtn.setAttribute('aria-label', 'Add Category');
    addBtn.innerHTML = '+';
    addBtn.onclick = () => {
        if (elements.categoryModal) {
            elements.categoryModal.classList.remove('hidden');
            if (elements.categoryNameInput) {
                elements.categoryNameInput.value = '';
                elements.categoryNameInput.focus();
            }
        }
    };
    elements.categoryFiltersContainer.appendChild(addBtn);
}

export function renderCategoryOptions(): void {
    if (!elements.taskCategorySelect) return;
    if (!state.categories || state.categories.length === 0) {
        state.categories = [...DEFAULT_CATEGORIES];
    }
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
