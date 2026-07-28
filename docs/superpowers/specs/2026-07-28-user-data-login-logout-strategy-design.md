# Design Specification: User Data Lifecycle for Login & Logout Flows

**Date:** 2026-07-28  
**Status:** Approved  
**Target Subsystems:** `auth.js`, `sync.js`, `state.js`, `storage.js`

---

## 1. Overview & Goals

Tài liệu này xác định quy trình xử lý dữ liệu người dùng khi thực hiện **Đăng nhập (Login)** và **Đăng xuất (Logout)** trong ứng dụng Pomodoro. 

Mục tiêu chính:
- **Bảo mật dữ liệu:** Xóa sạch dữ liệu tài khoản trên trình duyệt khi người dùng đăng xuất (tránh lộ thông tin trên máy dùng chung).
- **Không mất mát dữ liệu:** Tự động gộp dữ liệu vừa tạo ở chế độ vãng lai (Guest) vào tài khoản khi người dùng đăng nhập.
- **Đồng bộ đa thiết bị:** Khởi tạo lắng nghe thời gian thực (`onSnapshot`) ngay khi đăng nhập thành công và ngắt kết nối an toàn khi đăng xuất.

---

## 2. Data Scope & Structure

Ứng dụng quản lý 3 khối dữ liệu chính trong `state.js`:

| Dữ liệu | Mô tả | Xử lý khi Login | Xử lý khi Logout |
| :--- | :--- | :--- | :--- |
| **`tasks`** | Mảng danh sách công việc | Smart Union Merge (Gộp task Guest vào Cloud) | Clear mảng, reset về mảng rỗng `[]` |
| **`settings`** | Cài đặt timer, âm thanh, giao diện | Ưu tiên dữ liệu Cloud (fallback mặc định) | Reset về `DEFAULT_SETTINGS` |
| **`focusHistory`**| Thống kê tập trung theo ngày | Gộp dữ liệu ngày (Cloud làm chuẩn) | Clear object, reset về `{}` |

---

## 3. Login Data Lifecycle Flow

```
User Clicks Login
      │
      ▼
Firebase Auth Success (Google / Email)
      │
      ▼
1. Fetch Cloud Document: users/{user.uid}
      │
      ├───────────────────────────────┐
  Document Exists              Document New (First Login)
      │                               │
      ▼                               ▼
2. Smart Union Merge:           Save Current Guest Data
   - Cloud Tasks + Guest Tasks     as Initial Cloud Data
   - Cloud Settings priority
      │
      ▼
3. Update state.js & LocalStorage
      │
      ▼
4. Start Real-time Listener (onSnapshot)
      │
      ▼
5. Update UI (Render Tasks, Stats, Profile Header)
```

### Detailed Login Operations:
1. **Smart Merge Algorithm (`mergeDataOnLogin`):**
   - Lấy danh sách task hiện có ở local (Guest).
   - So sánh với task từ Cloud dựa trên `task.id`.
   - Các task local chưa tồn tại trên Cloud sẽ được nối thêm vào mảng task Cloud.
   - Ghi đè bản gộp hoàn chỉnh này lên Firestore `setDoc(userRef, mergedData, { merge: true })`.
2. **Real-time Synchronization (`setupRealtimeSync`):**
   - Đăng ký `onSnapshot` theo dõi `users/{user.uid}`.
   - Khi có thay đổi từ thiết bị khác -> cập nhật `state` và re-render UI.

---

## 4. Logout Data Lifecycle Flow

```
User Clicks Log Out
      │
      ▼
1. Unsubscribe Real-time Listener (onSnapshot)
      │
      ▼
2. Firebase Auth signOut()
      │
      ▼
3. Clear Local Storage & In-Memory State:
   - state.tasks = []
   - state.settings = DEFAULT_SETTINGS
   - state.focusHistory = {}
   - localStorage.removeItem('pomodoro_tasks')
   - localStorage.removeItem('pomodoro_settings')
   - localStorage.removeItem('pomodoro_history')
      │
      ▼
4. Update UI (Show Logged Out View, Reset Header Avatar)
```

---

## 5. Verification Plan

1. **Test Login với Task Guest:**
   - Tạo 2 task ở chế độ Guest -> Bấm đăng nhập Google -> Kiểm tra 2 task đó vẫn giữ nguyên và được đẩy lên Cloud.
2. **Test Logout Security:**
   - Đăng nhập -> Tạo task -> Bấm Log Out -> Kiểm tra màn hình quay về rỗng, LocalStorage được dọn sạch.
3. **Test Re-login:**
   - Đăng nhập lại tài khoản đó -> Dữ liệu trên Cloud tự động tải xuống chính xác.
