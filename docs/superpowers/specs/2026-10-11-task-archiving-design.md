# Design Document: Task Archiving & Permanent Deletion

## 1. Overview & Goals
Thay vì xóa task ngay lập tức khi người dùng click icon thùng rác hoặc để task hoàn thành nằm chiếm chỗ trong danh sách active, ứng dụng sẽ cung cấp tính năng **Lưu trữ (Archive)**:
- Khi task được đánh dấu hoàn thành (checked) hoặc người dùng bấm nút **Archive**, task sẽ được đưa vào kho lưu trữ (`isArchived: true`).
- Bổ sung nút / tab **Archived** trên thanh category filter hoặc góc Task Header để xem danh sách các task đã lưu trữ.
- Trong danh sách Archived, người dùng có thể:
  1. **Khôi phục lại (Unarchive / Restore)**: Đưa task trở lại danh sách làm việc chính.
  2. **Xóa vĩnh viễn (Permanently Delete)**: Xác nhận và xóa hẳn khỏi hệ thống / localStorage / Firestore cloud.
  3. **Xóa toàn bộ lưu trữ (Empty Archive)**: Một nút xóa sạch tất cả task đã lưu trữ nếu muốn dọn dẹp nhanh.

---

## 2. Data Structure & State Changes
Trong [src/js/types/index.ts](file:///D:/Apps/_Project/_Personal/Pomodoro/src/js/types/index.ts):
```typescript
export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actualPomodoros: number;
    isCompleted: boolean;
    isActive: boolean;
    categoryId?: string;
    isArchived?: boolean;     // Cờ xác định task đã archive chưa
    archivedAt?: number;      // Timestamp lúc archive (hỗ trợ sắp xếp/thống kê)
}
```
State `selectedCategoryFilter`:
- Khi chọn filter `all`, `cat_work`, ...: chỉ hiển thị các task có `!task.isArchived`.
- Bổ sung filter đặc biệt `'archived'`: chỉ hiển thị các task có `task.isArchived === true`.

---

## 3. UI/UX Interaction Design

### A. Danh sách Task chính:
- Thay icon thùng rác màu đỏ trên active task item thành icon **Archive** (hộp lưu trữ Lucide `archive` hoặc `folder-down`) có tooltip *"Archive Task"*.
- Khi hoàn thành task (toggle checkbox check), task có animation mờ dần hoặc giữ nguyên trạng thái gạch ngang và người dùng có thể bấm nút Archive để dọn dẹp danh sách gọn gàng.
- Bổ sung nút *"Archive All Completed"* ở đầu hoặc cuối danh sách nếu có nhiều task đã xong.

### B. Filter Bar & Mục Archive:
- Trên thanh `.category-filters`: Thêm một nút chip đặc biệt ở cuối:
  `<button class="category-filter-btn" data-category-id="archived"><i data-lucide="archive"></i> Archived (<count>)</button>`
- Khi bấm vào tab **Archived**:
  - Tiêu đề hoặc thanh filter hiển thị trạng thái đang xem kho lưu trữ.
  - Form thêm task sẽ tự động ẩn đi (vì đang xem kho lưu trữ).
  - Xuất hiện nút dọn dẹp nhanh: `Empty Archive` (Xóa tất cả lưu trữ).

### C. Giao diện Task Item trong Kho Archived:
- Mỗi item trong Archived sẽ có 2 nút hành động:
  1. **Nút Khôi phục (Restore)**: Icon `rotate-ccw` (tooltip: *"Restore task to active list"*). Bấm vào sẽ đổi `isArchived = false`.
  2. **Nút Xóa vĩnh viễn (Delete)**: Icon `trash-2` màu đỏ nguy hiểm (tooltip: *"Delete permanently"*). Có confirm xác nhận trước khi xóa hẳn.

---

## 4. Cloud Sync & Backward Compatibility
- Trường `isArchived` là optional boolean, an toàn 100% với các dữ liệu cũ trong localStorage và Firestore.
- Khi người dùng đăng nhập tài khoản Firebase, `state.tasks` chứa `isArchived` tự động đồng bộ lên Firestore như hiện tại.
