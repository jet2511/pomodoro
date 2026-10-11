# Archive Modal Redesign Specification

**Date:** 2026-10-11  
**Status:** Approved  
**Topic:** Task Archive Experience Redesign (Dedicated Modal & Category Pills Cleanup)

---

## 1. Context & Motivation

Trong phiên bản trước, tính năng Lưu trữ (Archive) được tích hợp tạm thời bằng cách thêm một pill `Archived (count)` vào dải bộ lọc danh mục (`.category-filters`). Điều này dẫn đến các vấn đề UX/UI:
1. **Lỗi thẩm mỹ giao diện**: Dải Category pills bị tràn ngang làm xuất hiện thanh cuộn trình duyệt (scrollbar) màu trắng/xám cắt ngang màn hình.
2. **Lẫn lộn khái niệm UX**: Nhóm nhãn danh mục công việc (`Work`, `Study`, `Personal`) với trạng thái vòng đời của task (`Archived`) gây nhầm lẫn tư duy quản lý.
3. **Chiếm dụng không gian làm việc**: Khi danh sách task lưu trữ dài, nó tràn ngập màn hình chính của ứng dụng Pomodoro.

**Giải pháp:** Tách biệt hoàn toàn tính năng Archive thành một **Modal chuyên dụng ("Kho lưu trữ công việc")**, đồng thời dọn dẹp hàng Category pills và đặt nút truy cập tinh tế cạnh tiêu đề `Tasks`.

---

## 2. UI/UX Specifications

### 2.1 Header Tasks & Trigger Button
- **Vị trí**: Nằm ở thanh tiêu đề của danh sách Tasks (`.tasks-header`), đối xứng với tiêu đề `Tasks`.
- **Giao diện nút trigger**:
  ```html
  <button id="open-archive-btn" class="archive-header-btn" title="Xem công việc đã lưu trữ" aria-label="Open archive modal">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
      </svg>
      <span>Kho lưu trữ</span>
      <span class="archive-count-badge" id="archive-count-badge">0</span>
  </button>
  ```
- **Hành vi**:
  - Khi có ít nhất 1 task archived: Badge hiển thị số lượng với màu nhấn nhẹ.
  - Khi không có task archived: Badge ẩn hoặc mờ nhẹ (`0`).

### 2.2 Category Pills Cleanup
- Loại bỏ hoàn toàn nút `Archived` khỏi `.category-filters`.
- Bổ sung CSS chống thanh cuộn ngang xấu xí:
  ```css
  .category-filters {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
  }
  .category-filters::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
  }
  ```

### 2.3 Archive Modal Layout
- **Modal ID**: `#archive-modal`
- **Backdrop**: Glassmorphism mờ nhẹ đồng bộ với theme hệ thống (`var(--glass-bg)`, `var(--glass-border)`, `backdrop-filter: blur(12px)`).
- **Header**:
  - Tiêu đề: **Kho lưu trữ công việc** (icon archive).
  - Nút **"Dọn sạch" (Empty All)**: Icon thùng rác kèm chữ, màu đỏ danger dịu, có dialog xác nhận trước khi thực thi `emptyArchivedTasks()`.
  - Nút đóng: `✕` (`#close-archive-btn`).
- **Thanh tìm kiếm (Search bar)**:
  - Input `#archive-search-input` để lọc nhanh danh sách task theo từ khóa realtime.
- **Danh sách Task lưu trữ (`#archive-task-list`)**:
  - Mỗi item hiển thị:
    - Trạng thái hoàn thành / chưa hoàn thành (checkbox mờ).
    - Tiêu đề task (gạch ngang nếu đã xong, màu text muted).
    - Badge danh mục tương ứng.
    - Số pomodoro: `${task.actualPomodoros} / ${task.estPomodoros}`.
    - Cặp nút hành động:
      - **Khôi phục (Restore)**: icon xoay ngược (`rotate-ccw`), hover xanh lá `#4ade80`, title "Khôi phục về danh sách chính".
      - **Xóa vĩnh viễn (Delete Permanently)**: icon thùng rác (`trash-2`), hover đỏ `#ef4444`, title "Xóa vĩnh viễn" (kèm dialog confirm).
- **Trạng thái rỗng (Empty State)**:
  - Khi không có task archived (hoặc tìm kiếm không ra kết quả): Hiển thị icon hộp rỗng kèm thông báo *"Chưa có công việc nào được lưu trữ"*.

---

## 3. Data & Architecture

### 3.1 State
- Model `Task` giữ nguyên:
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

### 3.2 Functions & Exports
- **`src/js/modules/tasks.ts`**:
  - `renderTasks()`: Chỉ hiển thị các task `!task.isArchived` theo filter category đang chọn.
  - `renderArchiveModal()`: Render nội dung bên trong modal lưu trữ và cập nhật số lượng badge `#archive-count-badge`.
  - `archiveTask(id)`: Chuyển task sang `isArchived = true`, cập nhật badge và re-render.
  - `restoreTask(id)`: Chuyển task sang `isArchived = false`, re-render active list và archive modal.
  - `deletePermanently(id)`: Xóa hẳn khỏi `state.tasks`.
  - `emptyArchivedTasks()`: Xóa toàn bộ task có `isArchived === true`.
- **`src/js/modules/categories.ts`**:
  - Loại bỏ hoàn toàn logic chèn nút `archived` vào `renderCategoryFilters()`.
- **`src/js/app.ts`**:
  - Event listeners mở/đóng modal archive (hỗ trợ phím Escape và click ngoài backdrop).
  - Event listeners tìm kiếm trong modal archive.
  - Event listener dọn sạch kho lưu trữ.

---

## 4. Verification & Testing

1. **Playwright E2E Tests (`tests/features.spec.js`)**:
   - Mở app, thêm task, bấm Archive trên task item.
   - Kiểm tra nút `#open-archive-btn` cập nhật badge `(1)`.
   - Bấm mở `#archive-modal`, kiểm tra task hiển thị trong modal.
   - Thử tính năng tìm kiếm trong archive modal.
   - Thử nút Restore -> task quay lại danh sách chính, badge cập nhật về `0`.
   - Archive lại và thử nút Delete Permanently -> task bị xóa hoàn toàn.
   - Thử nút Empty All nếu có nhiều task.
2. **Kiểm tra giao diện (Dark Mode & Light Mode)**:
   - Chụp ảnh kiểm chứng modal hiển thị hài hòa, không có scrollbar tràn ngang.
