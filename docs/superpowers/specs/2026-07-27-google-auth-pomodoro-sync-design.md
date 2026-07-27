# Design Specification: Google Authentication & Firestore Cloud Sync

**Date:** 2026-07-27  
**Status:** Proposal / Review  
**Target Subsystem:** `auth.js`, `sync.js`, `firebase.js`, `state.js`, `index.html`

---

## 1. Overview & Goals

Cung cấp tính năng đăng nhập bằng tài khoản Google (qua Firebase Auth Popup) và đồng bộ hóa toàn bộ dữ liệu Pomodoro (danh sách công việc, thiết lập timer, lịch sử tập trung) lên Cloud (Firestore) theo chế độ thời gian thực (Real-time Sync).

### Mục tiêu chính:
- **Đăng nhập Google 1-click:** Đăng nhập mượt mà qua Popup window mà không reload trang.
- **Đồng bộ thời gian thực (Real-time Sync):** Tự động cập nhật dữ liệu giữa các tab hoặc thiết bị khác nhau qua `onSnapshot`.
- **Hợp nhất dữ liệu thông minh (Smart Union Merge):** Giữ lại cả các task local vừa tạo khi đăng nhập tài khoản lần đầu.
- **Không làm giảm hiệu năng (Lazy Loaded SDK):** Tải SDK Firebase bất đồng bộ theo nhu cầu để tối ưu thời gian nạp trang đầu tiên.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------------+
|                           Client UI                               |
| (index.html, app.js, tasks.js, timer.js, settings.js, stats.js)    |
+---------------------------------+---------------------------------+
                                  |
            1. User Action /      |      4. UI Render & State
            State Change          |         Update
                                  v
+---------------------------------+---------------------------------+
|                       state.js (Central State)                    |
|                - tasks: []                                        |
|                - settings: {}                                     |
|                - focusHistory: {}                                 |
+-----------------+-------------------------------+-----------------+
                  |                               ^
   2. notifyState |                               | 3b. Real-time
      Change()    v                               |     Updates
+-----------------+-------------------------------+-----------------+
|                       sync.js (Sync Manager)                      |
|  - Outbound: Debounce (2000ms) syncDataToCloud()                  |
|  - Inbound:  Realtime Listener setupRealtimeSync() (onSnapshot)  |
|  - Guard Flags: isSyncing, isLoadingFromCloud                     |
+---------------------------------+---------------------------------+
                                  |
                     3a. Read / Write Firestore
                                  v
+---------------------------------+---------------------------------+
|                  Firebase v12 (Firestore & Auth)                  |
|  - Auth: signInWithPopup(GoogleAuthProvider)                      |
|  - Firestore Collection: users/{user.uid}                         |
+-------------------------------------------------------------------+
```

---

## 3. Detailed Component Design

### 3.1. Authentication Module (`src/js/modules/auth.js` & `firebase.js`)
- **SDK Lazy Loading:** Khi ứng dụng khởi chạy hoặc người dùng click "Continue with Google", `initFirebase()` sẽ tải động các SDK `firebase/app`, `firebase/auth`, `firebase/firestore`.
- **Google Sign-In Flow:**
  1. Khi người dùng click nút Google Login (`#google-login-btn`), hàm `signInWithPopup(auth, googleProvider)` được thực thi.
  2. Sự kiện `onAuthStateChanged(auth, user)` phát hiện trạng thái người dùng.
  3. Khi `user` hợp lệ:
     - Cập nhật UI Header (hiển thị tên người dùng và avatar).
     - Khởi tạo lắng nghe Real-time Sync qua `setupRealtimeSync(user)`.
     - Tự động đóng modal đăng nhập.
  4. Khi người dùng đăng xuất (`signOut`):
     - Huỷ đăng ký listener Real-time `onSnapshot`.
     - Reset UI Auth về trạng thái vãng lai (`showLoggedOutView`).

### 3.2. Sync Engine (`src/js/modules/sync.js`)
- **Smart Union Merge (`mergeDataOnLogin`):**
  - Khi đăng nhập, nếu trên Cloud đã có dữ liệu, tiến hành gộp danh sách task local chưa có ID trên Cloud vào mảng task Cloud.
  - Cập nhật `state.tasks`, `state.settings`, `state.focusHistory` và ghi đè bản gộp này lên Firestore để đảm bảo không mất mát dữ liệu.
- **Outbound Sync (`syncDataToCloud`):**
  - Đóng gói dữ liệu `state.tasks`, `state.settings`, `state.focusHistory`.
  - Thực hiện `setDoc(userRef, payload, { merge: true })` sau khoảng thời gian debounce (2000ms).
- **Inbound Real-time Sync (`setupRealtimeSync`):**
  - Sử dụng `onSnapshot(userRef, (docSnap) => ...)` để nhận thông báo thay đổi tức thì từ Cloud.
  - Sử dụng cờ `isSyncing` và `isLoadingFromCloud` để ngăn chặn vòng lặp cập nhật vô hạn giữa Push và Pull.
  - Khi nhận thay đổi từ tab/thiết bị khác:
    - Cập nhật `state` nội bộ.
    - Gọi các hàm render UI tương ứng (`renderTasks()`, `applySettingsToUI()`, `updateStatsUI()`).

### 3.3. Firestore Schema & Security Rules (`firestore.rules`)
- **Document Path:** `users/{userId}`
- **Data Payload Structure:**
  ```json
  {
    "tasks": [
      {
        "id": "uuid-string",
        "title": "Task name",
        "estPomodoros": 4,
        "actualPomodoros": 2,
        "isCompleted": false,
        "isActive": true
      }
    ],
    "settings": {
      "pomodoro": 25,
      "shortBreak": 5,
      "longBreak": 15,
      "longBreakInterval": 4,
      "autoStartBreaks": false,
      "autoStartPomodoros": false,
      "alarmSound": "bell",
      "tickingSound": "none",
      "volume": 50,
      "darkMode": true
    },
    "focusHistory": {
      "2026-07-27": { "seconds": 3000, "pomodoros": 2 }
    },
    "lastSynced": "TIMESTAMP"
  }
  ```
- **Security Rules:**
  ```firestore
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

---

## 4. Error Handling & Edge Cases

| Trạng thái / Edge Case | Khắc phục & Xử lý |
|-----------------------|-------------------|
| **Popup bị chặn (Popup Blocked)** | Bắt lỗi `auth/popup-blocked` từ Firebase và hiển thị thông báo hướng dẫn người dùng bỏ chặn popup trên trình duyệt. |
| **Mất kết nối Internet (Offline)** | Bật Firestore Offline Persistence (`enableMultiTabIndexedDbPersistence`). Mọi thay đổi được lưu tạm dưới local và tự đồng bộ khi có mạng lại. |
| **Lệch múi giờ Thống kê** | Ghi nhận `focusHistory` theo định dạng chuẩn local `YYYY-MM-DD` (`toLocaleDateString('en-CA')`). |
| **Đóng Popup giữa chừng** | Bắt lỗi `auth/popup-closed-by-user`, ẩn thông báo lỗi không cần thiết để tránh làm phiền người dùng. |

---

## 5. Verification Plan

1. **Test Đăng nhập Google:** Click nút "Continue with Google" -> popup Google hiển thị -> đăng nhập thành công -> Modal đóng & Header hiển thị tên user.
2. **Test Đồng bộ Task:** Tạo task mới -> chờ 2s -> kiểm tra dữ liệu xuất hiện trên Firestore Console.
3. **Test Real-time Multi-Tab:** Mở 2 tab trình duyệt cùng lúc -> thay đổi task ở Tab 1 -> Tab 2 lập tức cập nhật theo mà không cần reload.
4. **Test Logout:** Click Log Out -> Huỷ listener -> quay về giao diện vãng lai.
