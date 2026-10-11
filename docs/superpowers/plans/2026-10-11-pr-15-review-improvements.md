# PR #15 Review Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khắc phục triệt để các phát hiện hợp lý từ Code Review PR #15: chống XSS trong danh mục, ngăn xung đột phím tắt khi Confirm Modal đang mở, bảo toàn tính toàn vẹn của Task Active khi Cloud Sync kích hoạt, tự động reset danh mục khi Logout, và dọn dẹp git hygiene.

**Architecture:** Bổ sung hàm tiện ích `escapeHtml` tập trung vào `utils.ts` thay thế cách sanitize rải rác; thêm kiểm tra modal `#confirm-modal` trong global keydown listener của `app.ts`; cập nhật logic lọc task active trong `sync.ts` và làm mới danh mục trong `auth.ts`; thêm scroll/resize listener đóng inline popover; cập nhật git tracking loại bỏ `dist/index.html`; bổ sung E2E test Playwright kiểm chứng phím tắt và XSS.

**Tech Stack:** TypeScript, HTML5/CSS3, Playwright E2E, Vite.

---

### Task 1: Tạo Helper `escapeHtml` và Sanitize Triệt Để Category Name

**Files:**
- Modify: `src/js/modules/utils.ts`
- Modify: `src/js/modules/categories.ts`
- Modify: `src/js/modules/tasks.ts`
- Modify: `src/js/app.ts`

- [x] **Step 1: Viết hàm `escapeHtml(str: string): string` trong `src/js/modules/utils.ts`**

```typescript
export function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
```

- [x] **Step 2: Áp dụng `escapeHtml` trong `src/js/modules/categories.ts`**
  - Import `escapeHtml` từ `./utils`.
  - Trong `renderCategoryFilters`:
    ```typescript
    const safeName = escapeHtml(cat.name);
    btn.innerHTML = `<span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeName}</span>`;
    ```

- [x] **Step 3: Áp dụng `escapeHtml` trong `src/js/modules/tasks.ts`**
  - Import `escapeHtml` từ `./utils`.
  - Thay thế cách sanitize bằng `tempDiv` rải rác bằng `escapeHtml(task.title)` và `escapeHtml(cat.name)`.
  - Trong `renderTasks()`:
    ```typescript
    const sanitizedTitle = escapeHtml(task.title);
    const safeCatName = escapeHtml(cat.name);
    const categoryBadgeHtml = `<button type="button" class="task-category-badge" data-action="change-category" data-id="${task.id}" title="Click to change category" aria-label="Category: ${safeCatName}"><span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeCatName}</span><svg class="category-chevron" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 9l6 6 6-6"/></svg></button>`;
    ```
  - Trong `renderArchiveModal()`:
    ```typescript
    <span class="task-title-text">${sanitizedTitle}</span>
    <span class="task-category-badge-static">
        <span class="category-dot" style="background-color: ${cat.color}"></span>
        <span>${safeCatName}</span>
    </span>
    ```

- [x] **Step 4: Áp dụng `escapeHtml` trong `showCategoryPicker` ở `src/js/app.ts`**
  - Import `escapeHtml` từ `./modules/utils`.
  - Trong vòng lặp tạo item:
    ```typescript
    const safeName = escapeHtml(cat.name);
    item.innerHTML = `<span class="category-dot" style="background-color: ${cat.color}"></span><span>${safeName}</span>`;
    ```

---

### Task 2: Chặn Keyboard Shortcuts Khi Confirm Modal Đang Mở

**Files:**
- Modify: `src/js/app.ts:355-385`

- [x] **Step 1: Khai báo `isConfirmOpen` trong `src/js/app.ts`**

```typescript
const confirmModalEl = document.getElementById('confirm-modal');
const isConfirmOpen = confirmModalEl && !confirmModalEl.classList.contains('hidden');
```

- [x] **Step 2: Thêm `!isConfirmOpen` vào guard kiểm tra phím tắt**

```typescript
if (!typing && !e.ctrlKey && !e.altKey && !e.metaKey && !isSettingsOpen && !isAuthOpen && !isCategoryOpen && !isArchiveOpen && !isConfirmOpen) {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        toggleTimer();
    }
    // ...
}
```

---

### Task 3: Sửa Logic Active Task trong Cloud Sync & Reset Categories Khi Logout

**Files:**
- Modify: `src/js/modules/sync.ts:94-98`
- Modify: `src/js/modules/auth.ts:83-93`

- [x] **Step 1: Cập nhật tìm active task trong `src/js/modules/sync.ts`**
  - Đảm bảo task được chọn làm active không bị archived:
  ```typescript
  const active = state.tasks.find(t => t.isActive && !t.isArchived);
  state.activeTaskId = active ? active.id : null;
  ```
  - Nếu Archive Modal đang mở, làm mới danh sách trong modal:
  ```typescript
  if (elements.archiveModal && !elements.archiveModal.classList.contains('hidden')) {
      const searchVal = elements.archiveSearchInput ? elements.archiveSearchInput.value : '';
      renderArchiveModal(searchVal);
  }
  ```

- [x] **Step 2: Cập nhật `showLoggedOutView` trong `src/js/modules/auth.ts`**
  - Import `loadCategories` từ `./categories`.
  - Khi `shouldResetState === true`, gọi `loadCategories()` để đưa categories và filter chips trở về mặc định:
  ```typescript
  if (shouldResetState) {
      resetLocalState();
      loadCategories();
      renderTasks();
      updateStatsUI();
      applySettingsToUI();
  }
  ```

---

### Task 4: Tự Động Đóng Category Popover Khi Cuộn / Resize

**Files:**
- Modify: `src/js/app.ts:155-195`

- [x] **Step 1: Bổ sung event listeners `scroll` và `resize` khi mở Category Popover**
  - Trong `showCategoryPicker()`:
  ```typescript
  window.addEventListener('scroll', closeCategoryPicker, { passive: true, once: true });
  window.addEventListener('resize', closeCategoryPicker, { passive: true, once: true });
  ```
  - Trong `closeCategoryPicker()`: dọn dẹp các event listeners nếu chưa kích hoạt.

---

### Task 5: Dọn Dẹp Git Tracking `dist/index.html`

**Files:**
- Command: `git rm --cached dist/index.html`

- [x] **Step 1: Xóa `dist/index.html` khỏi git cache**
  - Run: `git rm --cached dist/index.html`
  - Đảm bảo `.gitignore` vẫn giữ `dist/`.

---

### Task 6: Viết Test Case Mới & Chạy Full Verification

**Files:**
- Modify: `tests/features.spec.js`

- [x] **Step 1: Bổ sung test kiểm tra phím tắt bị chặn khi Confirm Modal mở**
  - Mở confirm modal bằng action xóa vĩnh viễn hoặc gọi `customConfirm`.
  - Bấm phím `Space`, kiểm tra timer không chuyển sang running.
  - Bấm phím `Escape`, confirm modal đóng lại an toàn.

- [x] **Step 2: Bổ sung test kiểm tra XSS injection trong Category Name**
  - Tạo category có tên `<img src=x onerror=alert(1)>`.
  - Xác minh tên được render dưới dạng text an toàn và không thực thi mã độc.

- [x] **Step 3: Chạy toàn bộ test suite và typecheck**
  - Run: `npm run typecheck`
  - Run: `npm run test`
  - Kì vọng: 100% tests pass.
