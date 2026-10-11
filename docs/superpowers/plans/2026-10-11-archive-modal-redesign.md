# Archive Modal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi tính năng Archive từ dạng Category filter pill sang Modal chuyên dụng ("Kho lưu trữ công việc"), loại bỏ thanh scrollbar ngang thô ở hàng categories và cung cấp trải nghiệm quản lý lưu trữ cao cấp.

**Architecture:** Bổ sung markup `#archive-modal` và nút `#open-archive-btn` vào `index.html`; dọn dẹp logic chèn pill archive khỏi `categories.ts`; cập nhật `tasks.ts` để render danh sách trong modal kèm tìm kiếm realtime và cập nhật badge count; bổ sung CSS Glassmorphism cho modal và nút trigger; viết E2E test Playwright bao quát toàn bộ workflow.

**Tech Stack:** TypeScript, HTML5, CSS3 Glassmorphism, Playwright E2E.

---

### Task 1: Markup HTML cho Nút Trigger và Modal Lưu Trữ

**Files:**
- Modify: `index.html:81-86`
- Modify: `index.html:306-310`
- Modify: `src/js/modules/elements.ts`

- [x] **Step 1: Bổ sung nút trigger `#open-archive-btn` vào `.tasks-header` trong `index.html`**
  ```html
  <div class="tasks-header">
      <h2>Tasks</h2>
      <button type="button" id="open-archive-btn" class="archive-header-btn" title="Xem công việc đã lưu trữ" aria-label="Open archive modal">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          <span>Kho lưu trữ</span>
          <span class="archive-count-badge" id="archive-count-badge">0</span>
      </button>
  </div>
  ```

- [x] **Step 2: Bổ sung markup `#archive-modal` trước `#confirm-modal` trong `index.html`**
  ```html
  <!-- Archive Modal -->
  <div id="archive-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="archive-modal-title">
      <div class="modal-content glass-panel archive-modal-content">
          <div class="modal-header">
              <div class="archive-header-title-wrap">
                  <h2 id="archive-modal-title">Kho lưu trữ công việc</h2>
                  <span id="archive-modal-count" class="archive-modal-badge">0 tasks</span>
              </div>
              <div class="archive-header-actions">
                  <button type="button" id="archive-empty-btn" class="archive-btn-danger" title="Xóa tất cả các công việc đã lưu trữ">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Dọn sạch
                  </button>
                  <button type="button" id="close-archive-btn" class="icon-btn" aria-label="Close archive modal">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
              </div>
          </div>
          <div class="modal-body archive-modal-body">
              <div class="archive-search-wrapper">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="archive-search-input" class="archive-search-input" placeholder="Tìm kiếm công việc đã lưu..." autocomplete="off">
              </div>
              <div id="archive-task-list" class="archive-task-list">
                  <!-- Archived tasks injected via JS -->
              </div>
          </div>
      </div>
  </div>
  ```

- [x] **Step 3: Cập nhật DOM elements references trong `src/js/modules/elements.ts`**
  - Thêm `openArchiveBtn`, `archiveModal`, `closeArchiveBtn`, `archiveEmptyBtn`, `archiveSearchInput`, `archiveTaskList`, `archiveCountBadge`, `archiveModalCount`.

---

### Task 2: Dọn Dẹp Category Pills & Loại Bỏ Pill Archived

**Files:**
- Modify: `src/js/modules/categories.ts:135-150`
- Modify: `src/css/modules/tasks.css:346-370`

- [x] **Step 1: Xóa bỏ pill Archived khỏi `renderCategoryFilters()` trong `categories.ts`**
  - Đảm bảo category filters chỉ hiển thị các danh mục thực sự (`all` và các categories người dùng tạo).
  - Không còn `state.selectedCategoryFilter === 'archived'` trong categories module.

- [x] **Step 2: Thêm CSS ẩn scrollbar thô ở `.category-filters` trong `src/css/modules/tasks.css`**
  - `scrollbar-width: none;` và `::-webkit-scrollbar { display: none; }` để thanh danh mục luôn mượt mà.

---

### Task 3: Cập Nhật Logic Render và Tương Tác Archive Modal

**Files:**
- Modify: `src/js/modules/tasks.ts`
- Modify: `src/js/app.ts`

- [x] **Step 1: Cập nhật `tasks.ts`**
  - `renderTasks()`: Chỉ hiển thị các task active `!t.isArchived` theo filter category hiện tại. Luôn hiển thị `#add-task-form`.
  - Viết hàm `renderArchiveModal(searchQuery = '')`:
    - Lấy danh sách task `isArchived === true`.
    - Lọc theo `searchQuery` (không phân biệt hoa thường).
    - Cập nhật text badge số lượng `#archive-count-badge` và `#archive-modal-count`.
    - Render danh sách task lưu trữ vào `#archive-task-list` với:
      - Tên task và badge danh mục.
      - Số pomodoros.
      - Nút `restore-btn` (`data-action="restore"`).
      - Nút `delete-permanent-btn` (`data-action="delete-permanent"`).
    - Nếu danh sách trống: render Empty State sạch sẽ với icon hộp lưu trữ và thông báo *"Chưa có công việc nào được lưu trữ"*.
  - Cập nhật `archiveTask`, `restoreTask`, `deletePermanently`, `emptyArchivedTasks`: gọi `renderArchiveModal()` và cập nhật badge count.
  - Export `renderArchiveModal`.

- [x] **Step 2: Gắn Event Listeners trong `src/js/app.ts`**
  - Mở modal khi bấm `#open-archive-btn`.
  - Đóng modal khi bấm `#close-archive-btn`, click backdrop ngoài modal, hoặc bấm phím `Escape`.
  - Sự kiện `input` trên `#archive-search-input` để lọc kết quả realtime.
  - Bấm `#archive-empty-btn`: xác nhận qua `customConfirm('Bạn có chắc muốn xóa tất cả các công việc trong kho lưu trữ không?')`, nếu OK gọi `emptyArchivedTasks()`.
  - Bắt sự kiện click trong `#archive-task-list` cho các nút `restore` và `delete-permanent`.

---

### Task 4: Styling Glassmorphism cho Archive Header Button và Archive Modal

**Files:**
- Modify: `src/css/modules/tasks.css`

- [x] **Step 1: CSS cho `.tasks-header` và `.archive-header-btn`**
  - Bố trí flexbox: `display: flex; justify-content: space-between; align-items: center;`.
  - Nút `.archive-header-btn`: bo góc mềm mại, nền glass mờ nhẹ, hover đổi màu tinh tế, badge count nổi bật khi `count > 0`.
  - Thích ứng Dark Mode & Light Mode.

- [x] **Step 2: CSS cho `.archive-modal-content`, `.archive-search-input`, `.archive-task-list`**
  - Kích thước vừa vặn (`max-width: 520px; max-height: 80vh`).
  - Ô search có icon kính lúp, nền input glass trong suốt.
  - Danh sách task item có scroll mượt, padding cân đối, các nút restore (hover xanh lá) và xóa vĩnh viễn (hover đỏ) tinh tế.
  - Giao diện Empty state căn giữa, màu chữ dịu mắt.

---

### Task 5: Cập Nhật Playwright E2E Tests và Kiểm Thử Tự Động

**Files:**
- Modify: `tests/features.spec.js`

- [x] **Step 1: Cập nhật test case cho Archive Modal**
  - Thêm task mới -> Bấm nút Archive.
  - Xác nhận task biến mất khỏi danh sách chính, badge nút `#open-archive-btn` hiển thị `1`.
  - Bấm `#open-archive-btn` -> modal `#archive-modal` hiển thị.
  - Kiểm tra task nằm trong `#archive-task-list`.
  - Test ô tìm kiếm `#archive-search-input`.
  - Bấm nút Restore trong modal -> task quay lại danh sách chính, modal cập nhật về rỗng, badge về `0`.
  - Archive lại -> mở modal -> Bấm nút Delete Permanently -> Xác nhận confirm -> Task bị xóa vĩnh viễn.
  - Test nút Empty All nếu có nhiều task.

- [x] **Step 2: Chạy kiểm thử toàn bộ test suite**
  - Run: `npx playwright test` (Đảm bảo 13/13 tests pass).
  - Run: `npm run build` (Đảm bảo build không có lỗi).

---

### Task 6: Chụp Ảnh Nghiệm Thu và Báo Cáo

- [x] **Step 1: Chụp ảnh giao diện Modal Lưu Trữ ở Dark Mode và Light Mode**
- [x] **Step 2: Báo cáo kết quả chi tiết cho người dùng**
