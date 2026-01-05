# Tóm Tắt Luồng Hoạt Động - NgRx Jira Clone

## 🎯 Kiến Trúc Tổng Quan

```
USER ──► COMPONENT ──► ACTION ──► EFFECT ──► SERVICE ──► FIREBASE
                         │                                  │
                         ▼                                  │
                      REDUCER                               │
                         │                                  │
                         ▼                                  │
                       STORE ◄────────────────────────────┘
                         │         (Real-time Sync)
                         ▼
                     SELECTOR
                         │
                         ▼
                    COMPONENT ──► USER
```

---

## 📝 Các Luồng Chính

### 1️⃣ **ĐĂNG NHẬP**

```
User nhập email/password
  → Component dispatch AuthActions.login()
  → Effect gọi AuthService.login()
  → Firebase Authentication xác thực
  → Effect dispatch loginSuccess()
  → Reducer cập nhật auth state
  → Component navigate to /kanban
```

### 2️⃣ **LOAD TASKS**

```
Component ngOnInit()
  → Dispatch TaskActions.loadTasks()
  → Effect gọi TaskService.getTasks()
  → Firestore onSnapshot listener
  → Real-time stream of tasks
  → Effect dispatch loadTasksSuccess()
  → Reducer cập nhật tasks state
  → Selector filter & sort tasks
  → Component hiển thị tasks
```

### 3️⃣ **TẠO TASK MỚI**

```
User click "Create Task"
  → Modal mở
  → User điền form & submit
  → Component dispatch addTask()
  → Effect gọi TaskService.addTask()
  → Firestore thêm document mới
  → onSnapshot tự động emit tasks mới
  → UI tự động cập nhật
```

### 4️⃣ **DRAG & DROP**

```
User kéo task
  → onDrop() triggered
  → Tính toán order mới (fractional indexing)
  → Dispatch updateTask()
  → Effect gọi TaskService.updateTask()
  → Firestore cập nhật order/status
  → onSnapshot emit tasks mới
  → Selector sort lại theo order
  → UI re-render với vị trí mới
```

### 5️⃣ **FILTER TASKS**

```
User thay đổi filter
  → BehaviorSubject.next(newValue)
  → combineLatest tự động trigger
  → Filter logic chạy
  → Observable emit filtered tasks
  → Template tự động re-render
```

---

## 🔑 Các Thành Phần Chính

### **NgRx Store Structure**

```
AppState
├── auth: AuthState
│   ├── uid: string | null
│   ├── email: string | null
│   ├── isLoading: boolean
│   └── error: string | null
│
├── tasks: TasksState
│   ├── tasks: Task[]
│   ├── isLoading: boolean
│   └── error: string | null
│
└── user: UserState
    ├── users: User[]
    ├── isLoading: boolean
    └── error: string | null
```

### **Task Model**

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  reporterId: string;
  assigneeId?: string;
  priority?: 'High' | 'Medium' | 'Low';
  order?: number; // ← Cho drag & drop ordering
}
```

---

## 🔄 Real-time Sync

### **Firestore onSnapshot**

```typescript
onSnapshot(collection, (snapshot) => {
  const tasks = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  observer.next(tasks); // ← Tự động emit khi có thay đổi
});
```

### **Lợi ích:**

- ✅ Không cần polling
- ✅ Tự động sync giữa nhiều clients
- ✅ Offline support
- ✅ Optimistic updates

---

## 🎨 Component Hierarchy

```
App Component
├── Navbar (user info, logout)
├── Router Outlet
    ├── Login Component
    ├── Register Component
    └── Kanban Board Component
        ├── Filter Toolbar
        ├── Search Input
        ├── Column (To Do)
        │   └── Task Cards (cdkDrag)
        ├── Column (In Progress)
        │   └── Task Cards (cdkDrag)
        ├── Column (Done)
        │   └── Task Cards (cdkDrag)
        └── Add/Edit Task Modal
            ├── Task Form
            └── Comments Section
```

---

## 🚀 Key Features

### **1. Authentication**

- Firebase Authentication
- Email/Password login
- Auto-redirect after login
- Protected routes

### **2. Task Management**

- CRUD operations
- Real-time sync
- Assign to users
- Priority levels
- Comments

### **3. Drag & Drop**

- Cross-column movement
- Within-column reordering
- Fractional indexing
- Smooth animations

### **4. Filtering**

- Multi-select filters
- Search by title/description
- Filter by status, assignee, priority
- "My Tasks" vs "All Tasks" view

### **5. User Management**

- User profiles
- Display logged-in user info
- Assignee dropdown

---

## 📊 Data Flow Example: Creating a Task

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                     │
│    User fills form and clicks "Create"                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 2. COMPONENT                                            │
│    onSubmit() {                                         │
│      this.store.dispatch(TaskActions.addTask({         │
│        taskData: { title, description, ... }           │
│      }));                                               │
│    }                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 3. EFFECT                                               │
│    addtask$ = createEffect(() =>                        │
│      this.action$.pipe(                                 │
│        ofType(TaskActions.addTask),                     │
│        switchMap(({ taskData }) =>                      │
│          this.taskService.addTask(taskData)             │
│        )                                                │
│      )                                                  │
│    );                                                   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 4. SERVICE                                              │
│    addTask(taskdata) {                                  │
│      return from(                                       │
│        addDoc(this.getTasksCollection(), taskdata)      │
│      );                                                 │
│    }                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 5. FIREBASE/FIRESTORE                                   │
│    Document added to "tasks" collection                 │
│    ✓ Validation by Firestore Rules                     │
│    ✓ Triggers onSnapshot listeners                     │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 6. REAL-TIME LISTENER                                   │
│    onSnapshot() detects new document                    │
│    → Emits updated tasks array                          │
│    → Effect dispatches loadTasksSuccess()               │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 7. REDUCER                                              │
│    on(TaskActions.loadTasksSuccess, (state, {tasks}) => │
│      ({ ...state, tasks })                              │
│    )                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 8. SELECTOR                                             │
│    selectTodoTasksWithAssignee                          │
│    → Filter by status                                   │
│    → Sort by order                                      │
│    → Add assignee name                                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 9. COMPONENT                                            │
│    todoTasks$ | async                                   │
│    → Receives new task                                  │
│    → Angular change detection                           │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 10. UI UPDATE                                           │
│     New task card appears in column                     │
│     ✓ Smooth animation                                  │
│     ✓ Correct position (sorted by order)                │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Best Practices Implemented

### **NgRx**

- ✅ Single source of truth (Store)
- ✅ Immutable state updates
- ✅ Side effects in Effects
- ✅ Memoized selectors

### **Angular**

- ✅ Reactive forms
- ✅ OnPush change detection
- ✅ Standalone components
- ✅ Lazy loading

### **Firebase**

- ✅ Real-time listeners
- ✅ Security rules
- ✅ Data validation
- ✅ Offline support

### **Code Organization**

- ✅ Feature-based structure
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Type safety (TypeScript)

---

## 🎓 Học Từ Code Này

### **Patterns:**

1. **Redux Pattern**: Predictable state management
2. **Observer Pattern**: Reactive programming with RxJS
3. **Repository Pattern**: Services abstract data access
4. **Facade Pattern**: Selectors provide clean API

### **Concepts:**

1. **Unidirectional Data Flow**: Component → Action → Reducer → Store → Selector → Component
2. **Reactive Programming**: Everything is an Observable
3. **Immutability**: State never mutated directly
4. **Separation of Concerns**: Each layer has specific responsibility

---

## 📚 Tài Liệu Liên Quan

- `APPLICATION_FLOW.md` - Chi tiết từng luồng
- `DRAG_DROP_ORDERING.md` - Giải thích drag & drop
- `DRAG_DROP_INDEX_ADJUSTMENT.md` - Index calculation
- `INSPECTION_REPORT.md` - Phân tích tổng quan

---

Chúc bạn code vui! 🚀
