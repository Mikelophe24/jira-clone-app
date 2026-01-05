# Dự án Jira Clone - Tài liệu Tổng quan và Luồng hoạt động

Tài liệu này cung cấp cái nhìn chi tiết về cấu trúc mã nguồn, luồng dữ liệu và cách các thành phần trong hệ thống hoạt động cùng nhau.

## 1. Công nghệ sử dụng (Tech Stack)

- **Framework:** Angular 18+ (Standalone Components)
- **State Management:** NgRx (Store, Actions, Effects, Selectors)
- **Backend:** Firebase (Authentication & Cloud Firestore)
- **UI/UX:** SCSS (Custom Jira Design), Angular CDK (Drag and Drop)

---

## 2. Cấu trúc thư mục (Folder Structure)

- `src/app/auth`: Giao diện Đăng nhập (Login) và Đăng ký (Register).
- `src/app/kanban`: Chứa các component chính của bảng công việc (Board, Task Card, Add/Edit Modal).
- `src/app/store`: Trái tim của ứng dụng, nơi quản lý toàn bộ trạng thái (State).
  - `auth/`: Quản lý phiên đăng nhập người dùng.
  - `task/`: Quản lý danh sách công việc, cập nhật trạng thái, xóa task.
  - `user/`: Quản lý danh sách người dùng trong hệ thống (để chọn Assignee).
  - `comments/`: Quản lý bình luận cho từng task.

---

## 3. Luồng hoạt động của một tính năng (Data Flow)

Để hiểu mã nguồn, hãy đi theo luồng **Action -> Effect -> Service -> Reducer -> Component**:

### Ví dụ: Khi bạn tạo một Task mới

1.  **Component (`AddEditTask`):** Người dùng điền form và nhấn "Create".
    - `AddEditTask` sẽ _dispatch_ (gửi) một Action: `TaskActions.addTask({ taskData })`.
2.  **Effect (`TaskEffects`):** Lắng nghe Action `addTask`.
    - Nó sẽ gọi `TaskService.addTask()` để gửi dữ liệu lên **Firebase Firestore**.
    - Nếu thành công, nó gửi tiếp Action `addTaskSuccess`.
3.  **Reducer (`taskReducer`):** Lắng nghe `addTaskSuccess`.
    - Nó lấy dữ liệu mới trả về và cập nhật vào `State` trong bộ nhớ ứng dụng.
4.  **Selector (`task.selectors.ts`):**
    - Các Selector (như `selectAllTasks`) sẽ tự động nhận thấy State thay đổi.
    - Chúng tính toán lại (ví dụ: gán thêm tên người tạo - ReporterName) và đẩy dữ liệu mới xuống component.
5.  **Component (`KanbanBoard`):** Tự động render lại các thẻ task mới mà không cần load lại trang.

---

## 4. Giải thích các logic quan trọng

### A. Hệ thống Lọc (Filtering System) trong `KanbanBoard`

Phần này sử dụng RxJS nâng cao (`combineLatest`) để kết hợp nhiều nguồn dữ liệu:

- **Search Term:** Tìm theo tiêu đề/mô tả.
- **Priority/Status/Assignee:** Lọc đa điều kiện.
- **Luồng:** Bất kỳ khi nào một điều kiện lọc thay đổi, `combineLatest` sẽ chạy lại logic `filter()` trên danh sách task gốc để trả ra kết quả mới ngay lập tức.

### B. Kéo thả (Drag and Drop)

Sử dụng `CdkDragDrop`. Khi một thẻ task được thả vào cột mới:

- Hệ thống xác định `ID` của cột đích.
- Gửi một Action `updateTask` lên Store để lưu trạng thái mới (`To Do` -> `In Progress`) vào Firebase.

### C. Tự động hóa ID (JIRA-1, JIRA-2)

Trong `task.selectors.ts`, chúng ta không dùng ID dài ngoằng của Firebase để hiển thị. Thay vào đó, Selector sẽ duyệt qua danh sách và gán một `taskNumber` dựa trên vị trí của chúng, tạo cảm giác thân thiện hơn.

---

## 5. Firebase Integration

- **Auth:** Sử dụng `signInWithEmailAndPassword` và `createUserWithEmailAndPassword`. Session được lưu vào LocalStorage thông qua `ngrx-store-localstorage`.
- **Firestore:** Dữ liệu được tổ chức thành các Collection: `tasks`, `users`, `comments`.

---

## 6. Lời khuyên cho người mới (Clean Code)

- **Selectors:** Luôn dùng Selector để xử lý dữ liệu trước khi đưa vào Component (giúp component sạch hơn).
- **Effects:** Toàn bộ logic gọi API phải nằm ở Effect, không để ở Component.
- **Standalone:** Mỗi module là độc lập, dễ dàng bảo trì và mở rộng.
