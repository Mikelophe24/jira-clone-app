# Luồng Hoạt Động Chi Tiết - NgRx Jira Clone

## 📋 Tổng Quan Kiến Trúc

Ứng dụng sử dụng kiến trúc **NgRx (Redux pattern)** kết hợp với **Firebase/Firestore**:

```
┌─────────────┐
│   Angular   │
│  Component  │
└──────┬──────┘
       │
       ├─ Dispatch Actions
       │
┌──────▼──────┐
│  NgRx Store │ ◄─── Selectors ───┐
└──────┬──────┘                   │
       │                          │
       ├─ Trigger Effects         │
       │                          │
┌──────▼──────┐                   │
│   Effects   │                   │
└──────┬──────┘                   │
       │                          │
       ├─ Call Services           │
       │                          │
┌──────▼──────┐                   │
│  Firebase   │                   │
│  Firestore  │                   │
└──────┬──────┘                   │
       │                          │
       └─ Real-time Updates ──────┘
```

---

## 🔐 1. LUỒNG ĐĂNG NHẬP (Authentication Flow)

### **Bước 1: User nhập email/password và click Login**

**File:** `auth/login/login.ts`

```typescript
onLogin() {
  this.store.dispatch(AuthActions.login({
    email: this.email,
    password: this.password
  }));
}
```

### **Bước 2: NgRx Store nhận action LOGIN**

**File:** `store/auth/auth.action.ts`

```typescript
'Login': props<{ email: string; password: string }>()
```

### **Bước 3: Effect lắng nghe action và gọi Firebase**

**File:** `store/auth/auth.effect.ts`

```typescript
login$ = createEffect(() =>
  this.action$.pipe(
    ofType(AuthActions.login),
    switchMap(({ email, password }) =>
      this.authService.login(email, password).pipe(
        map((user) =>
          AuthActions.loginSuccess({
            uid: user.uid,
            email: user.email,
          })
        ),
        catchError((error) => of(AuthActions.loginFailure({ error })))
      )
    )
  )
);
```

### **Bước 4: AuthService gọi Firebase Authentication**

**File:** `store/auth/auth.service.ts`

```typescript
login(email: string, password: string): Observable<User> {
  return from(signInWithEmailAndPassword(this.auth, email, password))
    .pipe(map((credential) => credential.user));
}
```

### **Bước 5: Reducer cập nhật state**

**File:** `store/auth/auth.reducer.ts`

```typescript
on(AuthActions.loginSuccess, (state, { uid, email }) => ({
  ...state,
  uid,
  email,
  isLoading: false,
  error: null,
}));
```

### **Bước 6: Component subscribe selector và navigate**

**File:** `auth/login/login.ts`

```typescript
this.store.select(selectIsLoggedIn).subscribe((isLoggedIn) => {
  if (isLoggedIn) {
    this.router.navigate(['/kanban']);
  }
});
```

---

## 📊 2. LUỒNG LOAD TASKS (Load Tasks Flow)

### **Bước 1: Component dispatch loadTasks khi ngOnInit**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
ngOnInit(): void {
  this.store.dispatch(UserActions.loadUsers());
  this.store.dispatch(TaskActions.loadTasks());
}
```

### **Bước 2: Effect lắng nghe và gọi TaskService**

**File:** `store/task/task.effect.ts`

```typescript
loadTasks$ = createEffect(() =>
  this.action$.pipe(
    ofType(TaskActions.loadTasks),
    switchMap(() =>
      this.taskService.getTasks().pipe(
        map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
        catchError((error) => of(TaskActions.loadTasksFailure({ error })))
      )
    )
  )
);
```

### **Bước 3: TaskService tạo real-time listener với Firestore**

**File:** `store/task/task.service.ts`

```typescript
getTasks(): Observable<Task[]> {
  return new Observable<Task[]>((observer) => {
    return onSnapshot(
      this.getTasksCollection(),
      (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
          ...(doc.data() as Task),
          id: doc.id,
        }));
        observer.next(tasks);
      },
      (error) => observer.error(error)
    );
  });
}
```

### **Bước 4: Reducer cập nhật tasks trong store**

**File:** `store/task/task.reducer.ts`

```typescript
on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
  ...state,
  tasks,
  isLoading: false,
  error: null,
}));
```

### **Bước 5: Selectors xử lý và filter tasks**

**File:** `store/task/task.selectors.ts`

```typescript
// Kết hợp tasks với user info
export const selectTaskWithAssigneeInfo = createSelector(
  selectAllTasks,
  selectAllUsers,
  (tasks, users): TaskWithAssignee[] => {
    const usersMap = new Map(users.map((user) => [user.uid, user.name]));
    return tasks.map((task) => ({
      ...task,
      assigneeName: task.assigneeId ? usersMap.get(task.assigneeId) : undefined,
    }));
  }
);

// Filter theo status và sort theo order
export const selectTodoTasksWithAssignee = createSelector(selectTaskWithAssigneeInfo, (tasks) =>
  tasks.filter((task) => task.status === 'To Do').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);
```

### **Bước 6: Component subscribe selector để hiển thị**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
todoTasks$: Observable<TaskWithAssignee[]> = this.getFilteredTasks(
  this.allTodoTasks$,
  this.myTodoTasks$
);
```

**File:** `kanban/kanban-board/kanban-board.html`

```html
<app-task-card
  *ngFor="let task of todoTasks$ | async; trackBy: trackByTask"
  [task]="task"
  cdkDrag
></app-task-card>
```

---

## ➕ 3. LUỒNG TẠO TASK MỚI (Create Task Flow)

### **Bước 1: User click "Create Task" button**

**File:** `kanban/kanban-board/kanban-board.html`

```html
<button class="btn btn-primary create-btn" (click)="openModal()">+ Create Task</button>
```

### **Bước 2: Modal mở ra**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
openModal(task: Task | null = null) {
  this.editingTask = task;
  this.isModalOpen = true;
}
```

### **Bước 3: User điền form và submit**

**File:** `kanban/add-edit-task/add-edit-task.ts`

```typescript
onSubmit() {
  const payload = {
    title: this.taskData.title,
    description: this.taskData.description,
    status: this.taskData.status,
    assigneeId: this.taskData.assigneeId === null ? undefined : this.taskData.assigneeId,
  };

  // Get current user ID
  this.store
    .select(selectCurrentUserId)
    .pipe(filter((uid) => !!uid), first())
    .subscribe((reporterId) => {
      this.store.dispatch(
        TaskActions.addTask({
          taskData: {
            ...payload,
            reporterId: reporterId!,
            order: Date.now() // Timestamp as default order
          },
        })
      );
    });
}
```

### **Bước 4: Effect gọi TaskService.addTask()**

**File:** `store/task/task.effect.ts`

```typescript
addtask$ = createEffect(() =>
  this.action$.pipe(
    ofType(TaskActions.addTask),
    switchMap(({ taskData }) =>
      this.taskService.addTask(taskData).pipe(
        map((docRef) =>
          TaskActions.addTaskSuccess({
            task: { ...taskData, id: docRef.id },
          })
        ),
        catchError((error) => of(TaskActions.addTaskFailure({ error })))
      )
    )
  )
);
```

### **Bước 5: TaskService thêm document vào Firestore**

**File:** `store/task/task.service.ts`

```typescript
addTask(taskdata: Omit<Task, 'id'>): Observable<DocumentReference> {
  return from(addDoc(this.getTasksCollection(), taskdata));
}
```

### **Bước 6: Firestore trigger real-time listener**

Vì `getTasks()` đã setup `onSnapshot`, khi có task mới được thêm vào Firestore:

```typescript
onSnapshot(this.getTasksCollection(), (snapshot) => {
  const tasks = snapshot.docs.map(...);
  observer.next(tasks); // ← Tự động emit tasks mới
});
```

### **Bước 7: UI tự động cập nhật**

- Selector nhận tasks mới từ store
- Component nhận data mới từ observable
- Angular change detection render task mới lên UI

---

## 🔄 4. LUỒNG DRAG & DROP (Drag & Drop Flow)

### **Bước 1: User kéo task**

Angular CDK Drag & Drop tự động handle UI interactions.

### **Bước 2: User thả task → onDrop() triggered**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
onDrop(event: CdkDragDrop<TaskWithAssignee[]>) {
  const task = event.previousContainer.data[event.previousIndex];
  const isSameContainer = event.previousContainer === event.container;

  if (isSameContainer) {
    // CASE 1: Reordering trong cùng column

    // Remove task đang drag để tính toán chính xác
    const tasksWithoutDragged = event.container.data.filter(
      (t) => t.id !== task.id
    );

    // Điều chỉnh index khi drag xuống
    let targetIndex = event.currentIndex;
    if (event.previousIndex < event.currentIndex) {
      targetIndex = event.currentIndex - 1;
    }

    // Tính order mới
    const newOrder = this.calculateNewOrder(tasksWithoutDragged, targetIndex);

    // Dispatch update
    this.store.dispatch(
      TaskActions.updateTask({
        task: { id: task.id, order: newOrder },
      })
    );
  } else {
    // CASE 2: Di chuyển sang column khác

    const newStatus = this.getColumnStatus(event.container.id);
    const tasks = [...event.container.data];
    const newOrder = this.calculateNewOrder(tasks, event.currentIndex);

    this.store.dispatch(
      TaskActions.updateTask({
        task: { id: task.id, status: newStatus, order: newOrder },
      })
    );
  }
}
```

### **Bước 3: Tính toán order mới (Fractional Indexing)**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
private calculateNewOrder(tasks: TaskWithAssignee[], targetIndex: number): number {
  if (tasks.length === 0) return 1000;

  // Drop ở đầu
  if (targetIndex === 0) {
    const firstOrder = tasks[0]?.order ?? 1000;
    return firstOrder - 1000;
  }

  // Drop ở cuối
  if (targetIndex >= tasks.length) {
    const lastOrder = tasks[tasks.length - 1]?.order ?? 0;
    return lastOrder + 1000;
  }

  // Drop ở giữa
  const prevOrder = tasks[targetIndex - 1]?.order ?? 0;
  const nextOrder = tasks[targetIndex]?.order ?? prevOrder + 2000;
  return (prevOrder + nextOrder) / 2;
}
```

### **Bước 4: Effect gọi TaskService.updateTask()**

**File:** `store/task/task.effect.ts`

```typescript
updateTask$ = createEffect(() =>
  this.action$.pipe(
    ofType(TaskActions.updateTask),
    switchMap(({ task }) =>
      this.taskService.updateTask(task).pipe(
        map(() => TaskActions.updateTaskSuccess({ task })),
        catchError((error) => of(TaskActions.updateTaskFailure({ error })))
      )
    )
  )
);
```

### **Bước 5: TaskService update Firestore**

**File:** `store/task/task.service.ts`

```typescript
updateTask(taskdata: Partial<Task>): Observable<void> {
  const taskDocRef = doc(this.fireStore, `tasks/${taskdata.id}`);
  return from(updateDoc(taskDocRef, taskdata));
}
```

### **Bước 6: Real-time update tự động**

- Firestore trigger `onSnapshot` listener
- Tasks mới được emit
- Selector sort lại theo order
- UI re-render với vị trí mới

---

## 🎯 5. LUỒNG FILTER TASKS (Filter Flow)

### **Bước 1: User thay đổi filter**

**File:** `kanban/kanban-board/kanban-board.html`

```html
<div class="checkbox-option" (click)="toggleSelection(statusFilterSubject, status)">
  <input type="checkbox" [checked]="isSelected(statusFilterSubject, status)" />
  <span>{{ status }}</span>
</div>
```

### **Bước 2: Update BehaviorSubject**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
toggleSelection(subject: BehaviorSubject<string[]>, value: string) {
  const current = subject.getValue();
  if (current.includes(value)) {
    subject.next(current.filter((item) => item !== value));
  } else {
    subject.next([...current, value]);
  }
}
```

### **Bước 3: combineLatest tự động trigger**

**File:** `kanban/kanban-board/kanban-board.ts`

```typescript
getFilteredTasks(
  sourceAll$: Observable<TaskWithAssignee[]>,
  sourceMy$: Observable<TaskWithAssignee[]>
): Observable<TaskWithAssignee[]> {
  return combineLatest([
    source$,
    this.searchTerm$,
    this.priorityFilter$,
    this.assigneeFilter$,
    this.statusFilter$,
  ]).pipe(
    map(([tasks, term, selectedPriorities, selectedAssignees, selectedStatuses]) =>
      tasks.filter((task) => {
        const matchesTerm = !term ||
          task.title.toLowerCase().includes(term.toLowerCase());

        const matchesPriority = selectedPriorities.length === 0 ||
          (task.priority && selectedPriorities.includes(task.priority));

        const matchesAssignee = selectedAssignees.length === 0 ||
          (task.assigneeId && selectedAssignees.includes(task.assigneeId));

        const matchesStatus = selectedStatuses.length === 0 ||
          selectedStatuses.includes(task.status);

        return matchesTerm && matchesPriority && matchesAssignee && matchesStatus;
      })
    )
  );
}
```

### **Bước 4: Template tự động re-render**

```html
<app-task-card *ngFor="let task of todoTasks$ | async" [task]="task"></app-task-card>
```

---

## 👤 6. LUỒNG HIỂN THỊ USER INFO (User Info Flow)

### **Bước 1: App component load users khi khởi động**

**File:** `app.ts`

```typescript
ngOnInit(): void {
  this.store.dispatch(UserActions.loadUsers());
}
```

### **Bước 2: Effect load users từ Firestore**

**File:** `store/user/user.effect.ts`

```typescript
loadUsers$ = createEffect(() =>
  this.action$.pipe(
    ofType(UserActions.loadUsers),
    switchMap(() =>
      this.userService.getUsers().pipe(
        map((users) => UserActions.loadUsersSuccess({ users })),
        catchError((error) => of(UserActions.loadUsersFailure({ error })))
      )
    )
  )
);
```

### **Bước 3: Selector kết hợp auth state và users**

**File:** `store/user/user.selectors.ts`

```typescript
export const selectCurrentUser = createSelector(
  selectAuthState,
  selectAllUsers,
  (authState, users) => {
    if (!authState.uid) return null;
    return users.find((user) => user.uid === authState.uid) || null;
  }
);
```

### **Bước 4: Component subscribe và hiển thị**

**File:** `app.ts`

```typescript
currentUser$: Observable<User | null> = this.store.select(selectCurrentUser);
```

**File:** `app.html`

```html
<div class="user-info" *ngIf="currentUser$ | async as user">
  <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
  <div class="user-details">
    <div class="user-name">{{ user.name }}</div>
    <div class="user-email">{{ user.email }}</div>
  </div>
</div>
```

---

## 🔄 7. REAL-TIME SYNC FLOW

### **Cách hoạt động của Real-time Updates:**

```
User A tạo task mới
    ↓
Firestore nhận document mới
    ↓
Firestore trigger onSnapshot listeners của TẤT CẢ clients
    ↓
User B's app nhận snapshot mới
    ↓
TaskService emit tasks mới
    ↓
Effect dispatch loadTasksSuccess
    ↓
Reducer update store
    ↓
Selectors tính toán lại
    ↓
Components nhận data mới
    ↓
UI tự động re-render
```

**Không cần:**

- ❌ Polling
- ❌ Manual refresh
- ❌ WebSocket setup

**Firestore tự động handle:**

- ✅ Real-time sync
- ✅ Offline support
- ✅ Conflict resolution

---

## 📊 8. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                     │
└────────────┬────────────────────────────────────────────┘
             │
             ├─ Login
             ├─ Create Task
             ├─ Update Task
             ├─ Delete Task
             ├─ Drag & Drop
             ├─ Filter
             └─ Search
             │
┌────────────▼────────────────────────────────────────────┐
│                   ANGULAR COMPONENTS                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Login   │  │  Kanban  │  │  Add/Edit Task       │  │
│  │Component │  │  Board   │  │  Component           │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└───────┼─────────────┼───────────────────┼───────────────┘
        │             │                   │
        │ Dispatch    │ Dispatch          │ Dispatch
        │ Actions     │ Actions           │ Actions
        │             │                   │
┌───────▼─────────────▼───────────────────▼───────────────┐
│                      NGRX STORE                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Auth     │  │   Tasks    │  │   Users    │        │
│  │   State    │  │   State    │  │   State    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              SELECTORS                          │    │
│  │  - selectCurrentUser                            │    │
│  │  - selectTodoTasksWithAssignee                  │    │
│  │  - selectInProgressTasksWithAssignee            │    │
│  │  - selectDoneTasksWithAssignee                  │    │
│  └────────────────────────────────────────────────┘    │
└───────┬──────────────────────────────────────────────────┘
        │
        │ Trigger Effects
        │
┌───────▼──────────────────────────────────────────────────┐
│                       EFFECTS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  Auth    │  │  Task    │  │  User    │               │
│  │ Effects  │  │ Effects  │  │ Effects  │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
└───────┼─────────────┼─────────────┼────────────────────┘
        │             │             │
        │ Call        │ Call        │ Call
        │ Services    │ Services    │ Services
        │             │             │
┌───────▼─────────────▼─────────────▼────────────────────┐
│                      SERVICES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │   Task   │  │   User   │              │
│  │ Service  │  │ Service  │  │ Service  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        │ Firebase    │ Firestore   │ Firestore
        │ Auth API    │ API         │ API
        │             │             │
┌───────▼─────────────▼─────────────▼─────────────────────┐
│                   FIREBASE/FIRESTORE                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    Auth    │  │   tasks    │  │   users    │        │
│  │ Collection │  │ Collection │  │ Collection │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  Real-time Listeners (onSnapshot)                       │
│  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓                         │
└──────────────────────────────────────────────────────────┘
        │
        │ Real-time Updates
        │
        └──────────► Back to Services → Effects → Store → Components
```

---

## 🎯 9. KEY CONCEPTS

### **NgRx Pattern:**

1. **Actions**: Mô tả "cái gì xảy ra"
2. **Reducers**: Xử lý "state thay đổi như thế nào"
3. **Effects**: Xử lý "side effects" (API calls, etc.)
4. **Selectors**: Lấy và transform data từ store

### **Unidirectional Data Flow:**

```
Component → Action → Effect → Service → Firebase
                ↓
            Reducer
                ↓
            Store
                ↓
            Selector
                ↓
            Component
```

### **Reactive Programming:**

- Tất cả data flows là **Observables**
- Components **subscribe** to data streams
- UI **tự động update** khi data thay đổi

---

## 🚀 10. PERFORMANCE OPTIMIZATIONS

1. **OnPush Change Detection**: Components chỉ re-render khi input thay đổi
2. **TrackBy Functions**: Tối ưu \*ngFor rendering
3. **Selectors Memoization**: Cache computed values
4. **Real-time Listeners**: Chỉ update khi có thay đổi thực sự
5. **Lazy Loading**: Load modules khi cần

---

Đây là luồng hoạt động chi tiết của toàn bộ ứng dụng! Bạn có câu hỏi nào về phần nào không? 🎉
