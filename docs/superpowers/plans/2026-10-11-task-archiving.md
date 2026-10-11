# Task Archiving & Permanent Deletion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm tính năng lưu trữ task đã hoàn thành (Archive) thay vì xóa, hỗ trợ xem tab Archived, khôi phục (Restore), và xóa vĩnh viễn (Permanent Delete) kèm confirm.

**Architecture:** Bổ sung trường `isArchived` và `archivedAt` vào Task model, cập nhật filter logic để tách biệt active tasks và archived tasks, cập nhật UI category filters hiển thị tab `Archived (count)`, và render giao diện chuyên biệt cho task đã lưu trữ kèm các nút thao tác.

**Tech Stack:** TypeScript, HTML5, CSS3, Playwright E2E.

---

### Task 1: Cập nhật Types và Model Task

**Files:**
- Modify: `src/js/types/index.ts:8-16`

- [x] **Step 1: Bổ sung thuộc tính `isArchived` và `archivedAt`**
  ```typescript
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
  }
  ```

---

### Task 2: Logic Quản Lý Archive trong Module Tasks & Categories

**Files:**
- Modify: `src/js/modules/tasks.ts`
- Modify: `src/js/modules/categories.ts`

- [x] **Step 1: Thêm hàm `archiveTask(id: string)` và `restoreTask(id: string)`**
  - `archiveTask(id)`: đặt `task.isArchived = true`, `task.archivedAt = Date.now()`, nếu là task active thì hủy `activeTaskId = null`.
  - `restoreTask(id)`: đặt `task.isArchived = false`, lưu và re-render.
  - `emptyArchivedTasks()`: xóa hẳn toàn bộ task có `isArchived === true`.
  - `deletePermanently(id)`: xác nhận và xóa hẳn task khỏi `state.tasks`.

- [x] **Step 2: Cập nhật `renderTasks()` để lọc theo `isArchived`**
  - Nếu `state.selectedCategoryFilter === 'archived'`: chỉ render tasks có `task.isArchived === true`.
  - Nếu `state.selectedCategoryFilter !== 'archived'`: chỉ render tasks có `!task.isArchived`.
  - Nếu đang ở tab `archived`, ẩn form `#add-task-form` hoặc disable để tránh tạo nhầm vào kho lưu trữ.
  - Render icon nút cho task item:
    - Khi active: Nút **Archive** (icon hộp lưu trữ `archive`, data-action `archive`).
    - Khi trong tab Archived: Nút **Restore** (icon `rotate-ccw`, data-action `restore`) và Nút **Delete Permanently** (icon `trash-2`, data-action `delete-permanent`).

- [x] **Step 3: Cập nhật `renderCategoryFilters()` trong `categories.ts`**
  - Tính số lượng task archived: `const archivedCount = state.tasks.filter(t => t.isArchived).length`.
  - Nếu `archivedCount > 0` hoặc đang chọn tab `archived`, thêm nút tab Archived vào dải filter pills:
    `<button class="category-filter-btn ${state.selectedCategoryFilter === 'archived' ? 'active' : ''}" data-category-id="archived"><i data-lucide="archive"></i> Archived (${archivedCount})</button>`

---

### Task 3: Tương Tác Event Listeners và Confirm Dialog

**Files:**
- Modify: `src/js/app.ts`

- [x] **Step 1: Gắn sự kiện cho các action `archive`, `restore`, `delete-permanent`**
  - `archive`: gọi `archiveTask(id)`.
  - `restore`: gọi `restoreTask(id)`.
  - `delete-permanent`: gọi `customConfirm('Bạn có chắc muốn xóa vĩnh viễn task này không?')` trước khi gọi `deletePermanently(id)`.

- [x] **Step 2: Cập nhật CSS cho các nút hành động trong task item**
  - Nút archive: màu trung tính dịu mắt.
  - Nút restore: icon xoay khôi phục tinh tế.
  - Nút delete permanent: màu đỏ danger nổi bật.

---

### Task 4: Kiểm Thử E2E Tự Động với Playwright

**Files:**
- Modify: `tests/features.spec.js`

- [x] **Step 1: Viết test case luồng Archive & Restore & Permanent Delete**
  - Tạo 1 task mới.
  - Bấm nút Archive trên task item -> task biến mất khỏi danh sách Active, tab Archived xuất hiện với số lượng `(1)`.
  - Bấm tab Archived -> task xuất hiện trong danh sách lưu trữ.
  - Bấm nút Restore -> task quay lại danh sách Active.
  - Archive lại và bấm Delete Permanently -> task bị xóa vĩnh viễn khỏi toàn bộ hệ thống.

- [x] **Step 2: Chạy kiểm tra suite**
  - Run: `npx playwright test`

---

### Task 5: Chụp Ảnh Nghiệm Thu Giao Diện

- [x] **Step 1: Chụp ảnh Tab Archived và Task Item với các nút Restore / Delete**
- [x] **Step 2: Báo cáo hoàn tất cho user**
