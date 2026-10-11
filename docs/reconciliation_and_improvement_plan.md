# Kế hoạch cải thiện dự án Pomodoro (FocusTimer Pro)

## 1. Phản biện & Đánh giá lại các nhận định review trước (Doubt & Critical Reconciliation)

Trước khi bắt tay vào code, chúng ta cần đối chiếu lại các luận điểm của đợt review trước với thực tế codebase để sàng lọc **vấn đề thật** và **phát biểu chưa chính xác**:

### Nhận định 1: "Cần tách riêng hoặc sửa tests/sync.spec.js vì lỗi export 'db'"
- **Thực tế**: Đúng một phần nhưng chưa đủ sâu. 
  - `tests/sync.spec.js` là một unit test file viết bằng cú pháp Vitest (`import { describe, it, vi } from 'vitest'`).
  - Dự án hiện **chưa cài đặt `vitest`** trong `package.json` và cấu hình test runner chính của dự án là `"test": "npx playwright test"`.
  - Khi Playwright quét qua thư mục `tests/`, nó tự động gom cả `sync.spec.js` vào chạy. Do đó, Playwright cố nạp file đó như một Playwright test và văng lỗi import/mock.
  - **Kết luận**: Đây là một **issue thực sự** về tổ chức test suite. Cần chuyển đổi `sync.spec.js` thành Playwright test hoặc tách cấu hình test riêng, đồng thời cập nhật đúng theo `getDbRef()` / `initFirebase()`.

### Nhận định 2: "Playwright test fail do thiếu server local đang chạy"
- **Thực tế**: **Chính xác 100%**. 
  - Dự án hiện không có file `playwright.config.js` hay `playwright.config.ts`.
  - Khi chạy `npx playwright test`, Playwright dùng thiết lập mặc định và không tự khởi động Vite dev server. Các file spec hardcode `BASE_URL = 'http://localhost:5174/pomodoro/'` dẫn tới lỗi `net::ERR_CONNECTION_REFUSED`.
  - **Kết luận**: **Issue thực sự**. Cần tạo file cấu hình chuẩn `playwright.config.ts` có mục `webServer` để tự động spin up Vite server khi chạy test CI/Local.

### Nhận định 3: "README ghi phím tắt 'C' mở Settings nhưng app.ts chưa có"
- **Thực tế**: **Chính xác**.
  - Kiểm tra [app.ts](file:///D:/Apps/_Project/_Personal/Pomodoro/src/js/app.ts): Chỉ lắng nghe `Space` (Start/Pause), `S` (Skip), `T` (Task focus), `P` (Toggle PiP). 
  - Phím `C` (Customization/Settings) được ghi trong [README.md](file:///D:/Apps/_Project/_Personal/Pomodoro/README.md) nhưng trong code hoàn toàn chưa được gán listener.
  - **Kết luận**: **Issue thực sự**. Cần bổ sung xử lý phím `c` mở `toggleSettingsModal(true)` trong [app.ts](file:///D:/Apps/_Project/_Personal/Pomodoro/src/js/app.ts).

### Nhận định 4: "Refactor pip.ts vì file quá dài (~500 dòng)"
- **Thực tế**: **Chưa cấp thiết**. 
  - `pip.ts` tuy dài 499 dòng nhưng toàn bộ logic đóng gói tương tác trực tiếp với DOM window của Document PiP (vốn cần đồng bộ CSS, clone elements, gắn listener riêng).
  - Tách nhỏ ngay lúc này mang tính thẩm mỹ hơn là khắc phục bug, có nguy cơ làm gãy các tương tác đồng bộ của Document PiP API còn mới mẻ trên Chromium.
  - **Kết luận**: Giữ nguyên ổn định, chỉ dọn dẹp nếu có nhu cầu mở rộng tính năng PiP.

---

## 2. Kế hoạch triển khai (Implementation Plan)

### Phase 1: Chuẩn hóa hệ thống Test & Playwright Configuration
- **Task 1.1**: Tạo `playwright.config.ts` ở thư mục gốc:
  - Cấu hình `webServer` tự động chạy `npm run dev -- --port 5174`.
  - Cấu hình `testDir: './tests'`.
  - Bỏ qua các file không phải Playwright E2E hoặc chỉ định rõ `testMatch`.
- **Task 1.2**: Chuẩn hóa `tests/sync.spec.js`:
  - Đưa `sync.spec.js` về đúng chuẩn mock hoặc chuyển thành test tương thích với hệ thống module hiện tại (sử dụng `initFirebase` và `getDbRef`).

### Phase 2: Khắc phục phím tắt đồng bộ với Documentation
- **Task 2.1**: Bổ sung phím tắt `C` (Settings / Customization) vào `keydown` listener trong [src/js/app.ts](file:///D:/Apps/_Project/_Personal/Pomodoro/src/js/app.ts).
- **Task 2.2**: Viết bổ sung E2E test kiểm tra phím tắt `C` và `Escape` trong [tests/features.spec.js](file:///D:/Apps/_Project/_Personal/Pomodoro/tests/features.spec.js).

### Phase 3: Kiểm thử toàn diện & Verification
- **Task 3.1**: Chạy `npm run typecheck` để đảm bảo 0 lỗi TypeScript.
- **Task 3.2**: Chạy `npm test` (`npx playwright test`) để toàn bộ test cases pass tự động.
- **Task 3.3**: Chạy `npm run build` để kiểm chứng build production sạch.
