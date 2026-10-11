# Kế Hoạch Cải Thiện Giao Diện & Trải Nghiệm Task Categories (UI/UX Pro Max)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu hóa UI/UX tạo task không ma sát (Frictionless Quick Add), chọn lại category trực tiếp trên task item (Inline Category Switcher), và nâng cấp Modal tạo danh mục mới chuẩn Glassmorphism kèm Live Preview.

**Architecture:** Giữ nguyên State và Sync với Firestore, tinh gọn DOM của `#add-task-form` sang dạng 1 hàng thanh thoát, bổ sung cơ chế gán category mặc định dựa trên tab filter hiện tại, tích hợp interactive badge dropdown vào `.task-item`, và đại tu CSS của `#category-modal`.

**Tech Stack:** TypeScript, HTML5, CSS3 Glassmorphism, Playwright E2E.

---

### Task 1: Tinh gọn Form Tạo Nhanh Task (Quick Add Task Bar)

**Files:**
- Modify: `index.html:88-101`
- Modify: `src/js/modules/tasks.ts:36-56`
- Modify: `src/css/modules/tasks.css:24-150`

- [ ] **Step 1: Cập nhật DOM của `#add-task-form` trong `index.html`**
  - Bỏ dropdown `#task-category-select` to cồng kềnh trong thanh nhập.
  - Vẫn giữ input ẩn hoặc input số pomodoro gọn gàng (icon đồng hồ cát) và nút submit icon `+` nhỏ gọn thanh lịch ở cuối thanh nhập.
  - Bỏ nút `.add-btn` to bản màu tối chiếm diện tích ở phía dưới.
  
- [ ] **Step 2: Cập nhật logic `addTask` trong `src/js/modules/tasks.ts`**
  - Khi thêm task: nếu không truyền `categoryId`, kiểm tra `state.selectedCategoryFilter`.
  - Nếu `state.selectedCategoryFilter !== 'all'`, tự động gán category đó cho task mới.
  - Nếu `state.selectedCategoryFilter === 'all'`, gán category mặc định là `'cat_general'`.

- [ ] **Step 3: Cải thiện CSS của `.task-form` trong `src/css/modules/tasks.css`**
  - Chuyển `.task-form` thành thanh input duy nhất, bo góc mượt `12px`, nền mờ nhẹ nhàng `rgba(255, 255, 255, 0.08)`.
  - Nút thêm task tích hợp trực tiếp vào góc phải input (hoặc Enter to submit).

- [ ] **Step 4: Kiểm tra nhanh bằng build/test**
  - Run: `npx playwright test`

---

### Task 2: Thêm Tính Năng Đổi Nhanh Category Trực Tiếp Trên Task Item (Inline Category Switcher)

**Files:**
- Modify: `src/js/modules/tasks.ts:135-165`
- Modify: `src/css/modules/tasks.css:435-460`
- Modify: `src/js/modules/categories.ts:70-100`

- [ ] **Step 1: Tạo Interactive Badge & Category Popover Menu**
  - Badge `.task-category-badge` trên mỗi task item có thuộc tính `role="button"`, `tabindex="0"`, có hiệu ứng hover và icon chevron-down nhỏ.
  - Khi click vào badge, mở một dropdown menu mini gồm danh sách tất cả category hiện có (kèm chấm màu).
  
- [ ] **Step 2: Thêm hàm cập nhật Category cho Task trong `tasks.ts`**
  - Hàm `updateTaskCategory(taskId: string, categoryId: string): void`.
  - Cập nhật state, lưu localStorage, đồng bộ nếu có auth, và gọi `renderTasks()`.

- [ ] **Step 3: Styling cho Category Popover Dropdown**
  - Nền dark glassmorphism sang trọng, border `rgba(255, 255, 255, 0.2)`, z-index nổi bật, animation fade-in 150ms.
  - Tự động đóng popover khi click ra ngoài (outside click).

---

### Task 3: Đại Tu UI Modal Tạo Category Chuẩn Glassmorphism & Live Preview

**Files:**
- Modify: `index.html:275-296`
- Modify: `src/js/modules/categories.ts:130-170`
- Modify: `src/css/modules/modal.css:20-60`
- Modify: `src/css/modules/tasks.css:455-482`

- [ ] **Step 1: Thêm khung Live Preview Badge vào HTML Modal**
  - Thêm một khu vực preview nhỏ phía trên input:
    ```html
    <div class="category-preview-container">
        <span class="preview-label">Preview:</span>
        <span id="category-preview-badge" class="task-category-badge">
            <span class="category-dot" style="background-color: #4F46E5;"></span>
            <span id="category-preview-text">New Category</span>
        </span>
    </div>
    ```
- [ ] **Step 2: Tinh chỉnh Input và Nút Hành Động**
  - Style lại input `#category-name-input` với glass style (nền mờ, text sáng, border highlight khi focus).
  - Cập nhật footer modal: Thay nút to thô bằng 2 nút: `Cancel` (ghost button) và `Create Category` (accent button bo tròn mềm mại).
  - Nút thêm `+` ở thanh filter: Tăng touch target lên 36x36px với hover ripple effect.

- [ ] **Step 3: Logic tương tác Live Preview trong `categories.ts`**
  - Lắng nghe sự kiện `input` trên `#category-name-input` để cập nhật `#category-preview-text` thời gian thực.
  - Khi click chọn màu swatch, cập nhật màu của `.category-dot` trong `#category-preview-badge`.

---

### Task 4: Cập Nhật & Bổ Sung E2E Tests với Playwright

**Files:**
- Modify: `tests/features.spec.js`

- [ ] **Step 1: Cập nhật test cũ phù hợp với Quick Add**
  - Điều chỉnh test tạo task với category (tạo task nhanh -> đổi category trực tiếp trên badge hoặc tạo task khi filter đang chọn).
- [ ] **Step 2: Thêm test case cho Inline Category Switcher**
  - Click vào badge danh mục trên task -> chọn category khác -> kiểm tra badge cập nhật đúng màu và tên mới.
- [ ] **Step 3: Chạy toàn bộ Playwright suite**
  - Run: `npx playwright test`

---

### Task 5: Chụp Ảnh Playwright Kiểm Tra Giao Diện Thực Tế

- [ ] **Step 1: Chụp ảnh Before / After**
  - Chụp màn hình Quick Add Bar, Task Item với Popover, và Modal Category mới.
- [ ] **Step 2: Báo cáo nghiệm thu cho User**
