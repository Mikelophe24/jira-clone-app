# 📋 TÓM TẮT DỰ ÁN JIRA CLONE - HÀNH TRÌNH PHÁT TRIỂN

> **Tác giả**: Bạn  
> **Thời gian**: 24/12/2024 - 30/12/2024  
> **Công nghệ chính**: Angular 21, NgRx 18, Firebase, TypeScript

---

## 📑 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc ứng dụng](#2-kiến-trúc-ứng-dụng)
3. [Hành trình phát triển](#3-hành-trình-phát-triển)
4. [Chi tiết kỹ thuật](#4-chi-tiết-kỹ-thuật)
5. [Các vấn đề đã giải quyết](#5-các-vấn-đề-đã-giải-quyết)
6. [Kiến thức đã học](#6-kiến-thức-đã-học)
7. [Kết luận](#7-kết-luận)

---

## 1. TỔNG QUAN DỰ ÁN

### 🎯 Mục tiêu

Xây dựng một ứng dụng quản lý công việc theo mô hình Kanban Board (tương tự Jira) sử dụng Angular và NgRx để quản lý state.

### 🛠️ Tech Stack

#### Frontend Framework

- **Angular 21.0.0** - Framework chính
- **TypeScript 5.9.2** - Ngôn ngữ lập trình
- **SCSS** - Styling

#### State Management

- **@ngrx/store 18.1.1** - Quản lý state toàn cục
- **@ngrx/effects 18.1.1** - Xử lý side effects
- **@ngrx/router-store 18.1.1** - Đồng bộ router với store
- **@ngrx/store-devtools 18.1.1** - Debug tools
- **ngrx-store-localstorage 20.0.0** - Persist state

#### Backend & Database

- **Firebase 12.7.0** - Backend as a Service
- **@angular/fire 20.0.1** - Angular Firebase integration
  - Firebase Authentication - Xác thực người dùng
  - Cloud Firestore - NoSQL database

#### UI Components

- **@angular/cdk 19.2.19** - Component Dev Kit (Drag & Drop)

#### Testing

- **Vitest 4.0.8** - Testing framework
- **jsdom 27.1.0** - DOM testing utilities

---

## 2. KIẾN TRÚC ỨNG DỤNG

### 📁 Cấu trúc thư mục

```
ngrx-jira-clone/
├── src/
│   ├── app/
│   │   ├── auth/                    # Module xác thực
│   │   │   ├── login/              # Component đăng nhập
│   │   │   ├── register/           # Component đăng ký
│   │   │   └── auth-guard.ts       # Route guard
│   │   │
│   │   ├── kanban/                  # Module Kanban Board
│   │   │   ├── kanban-board/       # Component board chính
│   │   │   └── task-card/          # Component card task
│   │   │
│   │   ├── store/                   # NgRx Store
│   │   │   ├── auth/               # Auth state management
│   │   │   │   ├── auth.action.ts
│   │   │   │   ├── auth.effect.ts
│   │   │   │   ├── auth.reducer.ts
│   │   │   │   ├── auth.selector.ts
│   │   │   │   ├── auth.model.ts
│   │   │   │   └── auth.service.ts
│   │   │   │
│   │   │   ├── task/               # Task state management
│   │   │   │   ├── task.actions.ts
│   │   │   │   ├── task.effect.ts
│   │   │   │   ├── task.reducer.ts
│   │   │   │   ├── task.selectors.ts
│   │   │   │   ├── task.model.ts
│   │   │   │   └── task.service.ts
│   │   │   │
│   │   │   └── user/               # User state management
│   │   │       ├── user.actions.ts
│   │   │       ├── user.effects.ts
│   │   │       ├── user.reducer.ts
│   │   │       ├── user.selectors.ts
│   │   │       ├── user.model.ts
│   │   │       └── user.service.ts
│   │   │
│   │   ├── app.config.ts           # App configuration
│   │   ├── app.routes.ts           # Routing configuration
│   │   └── app.ts                  # Root component
│   │
│   ├── environments/
│   │   └── environment.ts          # Firebase config
│   │
│   └── main.ts                     # Bootstrap file
│
├── docs/                           # Documentation
├── package.json
└── angular.json
```

### 🏗️ Kiến trúc NgRx

Dự án sử dụng **NgRx Pattern** với 3 store chính:

#### 1. **Auth Store** - Quản lý xác thực

```typescript
State: {
  uid: string | null
  email: string | null
  isLoading: boolean
  error: string | null
}

Actions:
- login(email, password)
- loginSuccess(uid, email)
- loginFailure(error)
- register(email, password, name)
- registerSuccess(uid, email)
- registerFailure(error)
- logout()
- logoutSuccess()

Effects:
- login$ → Firebase Auth → loginSuccess/loginFailure
- register$ → Firebase Auth → Create User Doc → registerSuccess/registerFailure
- logout$ → Firebase signOut → logoutSuccess → Navigate to /login
- authSuccess$ → Navigate to /dashboard
```

#### 2. **Task Store** - Quản lý công việc

```typescript
State: {
  tasks: Task[]
  isLoading: boolean
  error: string | null
}

Task Model: {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  assigneeId: string
  createdAt: Date
  updatedAt: Date
}

Actions:
- loadTasks()
- loadTasksSuccess(tasks)
- loadTasksFailure(error)
- addTask(taskData)
- addTaskSuccess(task)
- addTaskFailure(error)
- updateTask(task)
- updateTaskSuccess(task)
- updateTaskFailure(error)
- deleteTask(taskId)
- deleteTaskSuccess(taskId)
- deleteTaskFailure(error)

Effects:
- loadTasks$ → Firestore getTasks → loadTasksSuccess/Failure
- addTask$ → Firestore addTask → addTaskSuccess/Failure
- updateTask$ → Firestore updateTask → updateTaskSuccess/Failure
- deleteTask$ → Firestore deleteTask → deleteTaskSuccess/Failure

Selectors:
- selectAllTasks
- selectTodoTasks (status === 'todo')
- selectInProgressTasks (status === 'in-progress')
- selectDoneTasks (status === 'done')
- selectTasksLoading
- selectTasksError
```

#### 3. **User Store** - Quản lý người dùng

```typescript
State: {
  users: User[]
  isLoading: boolean
  error: string | null
}

User Model: {
  uid: string
  email: string
  name: string
}

Actions:
- loadUsers()
- loadUsersSuccess(users)
- loadUsersFailure(error)

Effects:
- loadUsers$ → Firestore getUsers → loadUsersSuccess/Failure
```

### 🔄 Data Flow (Luồng dữ liệu)

```
Component → Dispatch Action → Effect → Service → Firebase
                ↓                                      ↓
            Reducer ← Success/Failure Action ←─────────┘
                ↓
            Store (Updated State)
                ↓
            Selector
                ↓
            Component (Re-render)
```

**Ví dụ cụ thể: Login Flow**

1. User nhập email/password và click "Login"
2. Component dispatch `AuthActions.login({ email, password })`
3. Reducer nhận action → set `isLoading = true`
4. Effect `login$` bắt action → gọi `authService.login()`
5. AuthService gọi Firebase Authentication
6. Firebase trả về UserCredential
7. Effect dispatch `AuthActions.loginSuccess({ uid, email })`
8. Reducer nhận success → update state với uid, email, `isLoading = false`
9. Effect `authSuccess$` bắt loginSuccess → navigate to `/dashboard`
10. Component subscribe selector → hiển thị UI mới

---

## 3. HÀNH TRÌNH PHÁT TRIỂN

### 📅 Timeline Chi Tiết

#### **Giai đoạn 1: Học tập Nền tảng (24-26/12/2024)**

##### 24/12/2024 - Tìm hiểu NgRx Signal Store

- **Mục tiêu**: Hiểu về state management trong Angular
- **Nội dung học**:
  - Tìm hiểu `withState()` để khởi tạo global state
  - Học về `signalMethod` và `rxMethod` cho reactive updates
  - Hiểu về data polling và infinite scrolling
- **Kết quả**: Nắm được cơ bản về reactive programming với NgRx

##### 25/12/2024 - Học React.js (Mở rộng kiến thức)

- **Mục tiêu**: So sánh state management giữa React và Angular
- **Nội dung học**:
  - JSX syntax
  - React hooks
  - Component lifecycle
- **Kết quả**: Hiểu rõ hơn về component-based architecture

##### 26/12/2024 - Tiếp tục học React

- **Nội dung**: Thực hành các ví dụ cơ bản về JSX
- **Gặp lỗi**: npm package.json error khi chạy `npm run dev`
- **Giải quyết**: Tạo lại package.json và cài đặt dependencies

---

#### **Giai đoạn 2: Thiết kế Kiến trúc (27/12/2024)**

##### 27/12 Sáng - Review Kiến trúc Jira Clone

- **Hoạt động**: Đánh giá và thiết kế folder structure
- **Quyết định**:
  - Sử dụng NgRx cho state management
  - Chia ứng dụng thành 3 modules chính: Auth, Kanban, Store
  - Mỗi store có đầy đủ: actions, effects, reducers, selectors, models, services

##### 27/12 Chiều - Implement Auth Store

- **Tạo file**:

  - `auth.action.ts` - Định nghĩa actions
  - `auth.reducer.ts` - Xử lý state changes
  - `auth.effect.ts` - Xử lý side effects
  - `auth.selector.ts` - Query state
  - `auth.model.ts` - Type definitions
  - `auth.service.ts` - Firebase integration

- **Gặp lỗi #1**: "Cannot redeclare block-scoped variable 'initialState'"

  - **Nguyên nhân**: Khai báo `initialState` nhiều lần
  - **Giải quyết**: Xóa các khai báo trùng lặp

- **Gặp lỗi #2**: "Property 'email' does not exist on type..."
  - **Nguyên nhân**: Không destructure đúng properties từ action
  - **Giải quyết**: Sửa reducer để lấy `uid` và `email` từ action payload
  ```typescript
  on(AuthActions.loginSuccess, (state, { uid, email }) => ({
    ...state,
    uid,
    email,
    isLoading: false,
  }));
  ```

##### 27/12 Tối - Hiểu sâu về NgRx Auth Store

- **Học**:
  - Cách actions flow qua reducers
  - Cách effects xử lý async operations
  - Cách selectors query state efficiently
- **Kết quả**: Hiểu rõ pattern và có thể áp dụng cho các stores khác

---

#### **Giai đoạn 3: Phát triển Tính năng (30/12/2024)**

##### 30/12 Sáng (04:25-05:14) - Fix Auth Effect

- **Gặp lỗi #3**: "Argument of type 'void' is not assignable to parameter of type 'string'"

  - **Vị trí**: `auth.effect.ts:43`
  - **Nguyên nhân**: Truyền `void` thay vì `name` vào `createUserDocument()`
  - **Giải quyết**: Destructure `name` từ action và truyền đúng

  ```typescript
  switchMap(({ email, password, name }) =>
    this.authService.register(email, password).pipe(
      mergeMap((userCred) =>
        this.authService.createUserDocument(
          userCred.user.uid!,
          userCred.user.email!,
          name // ← Fix: truyền name từ action
        )
      )
    )
  );
  ```

- **Gặp lỗi #4**: "Expected 1-2 arguments, but got 3"

  - **Vị trí**: `auth.effect.ts:81`
  - **Nguyên nhân**: Sai cú pháp `createEffect` - thiếu `pipe()` trong arrow function
  - **Giải quyết**: Sửa lại cấu trúc effect

  ```typescript
  // SAI:
  authSuccess = createEffect(
    () => this.actions$.pipe(ofType(...)),
        tap(() => this.router.navigate(['/dashboard'])),
    { dispatch: false }
  );

  // ĐÚNG:
  authSuccess$ = createEffect(
    () => this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(() => this.router.navigate(['/dashboard']))
    ),
    { dispatch: false }
  );
  ```

##### 30/12 Sáng (06:49) - Fix Routes

- **Gặp lỗi #5**: "Cannot find name 'loadCompoent'"
  - **Nguyên nhân**: Typo trong `app.routes.ts`
  - **Giải quyết**: Sửa `loadCompoent` → `loadComponent`

##### 30/12 Sáng (07:34-07:56) - Fix Login Loading State

- **Gặp lỗi #6**: "Property 'isLoading$' does not exist on type 'Login'"
  - **Nguyên nhân**: Naming mismatch trong template
  - **Giải quyết**: Đổi tên property hoặc sửa template cho khớp

##### 30/12 Sáng (08:10) - Fix Task Type Collision

- **Gặp lỗi #7**: Type collision giữa Zone.js Task và custom Task model
  - **Nguyên nhân**: Zone.js có type `Task` global, conflict với custom Task
  - **Giải quyết**: Import và sử dụng explicit type
  ```typescript
  import { Task } from './task.model';
  // Sử dụng Task từ model thay vì global Task
  ```

##### 30/12 Sáng (09:08-09:10) - Fix Task Add Effect

- **Gặp lỗi #8**: "Type mismatch" khi add task

  - **Nguyên nhân**: Truyền cả action object thay vì chỉ taskData
  - **Giải quyết**: Destructure `taskData` từ action

  ```typescript
  // SAI:
  switchMap(
    (action) => this.taskService.addTask(action) // ← Sai: truyền cả action
  );

  // ĐÚNG:
  switchMap(
    ({ taskData }) => this.taskService.addTask(taskData) // ← Đúng: chỉ truyền data
  );
  ```

##### 30/12 Sáng (09:23-09:25) - Fix File Casing

- **Gặp lỗi #9**: File casing inconsistency
  - **Nguyên nhân**: `user.actions.ts` vs `user.actionS.ts`
  - **Giải quyết**: Đổi tên file cho consistent

##### 30/12 Sáng (09:26-09:27) - Fix User Type Mismatch

- **Gặp lỗi #10**: Firebase User[] không match với custom User[]
  - **Nguyên nhân**: Firebase User thiếu property `name`
  - **Giải quyết**: Map Firebase User sang custom User model
  ```typescript
  map((firebaseUsers) =>
    UserActions.loadUsersSuccess({
      users: firebaseUsers.map((u) => ({
        uid: u.uid,
        email: u.email!,
        name: u.displayName || 'Unknown',
      })),
    })
  );
  ```

---

## 4. CHI TIẾT KỸ THUẬT

### 🔐 Authentication Flow

#### Firebase Authentication Setup

```typescript
// environment.ts
export const environment = {
  firebase: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
};

// app.config.ts
provideFirebaseApp(() => initializeApp(environment.firebase)),
provideAuth(() => getAuth()),
```

#### Auth Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Đăng nhập
  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  // Đăng ký
  register(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  // Tạo user document trong Firestore
  createUserDocument(uid: string, email: string, name: string): Observable<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(setDoc(userRef, { uid, email, name, createdAt: new Date() }));
  }

  // Đăng xuất
  logout(): Observable<void> {
    return from(this.auth.signOut());
  }
}
```

#### Auth Guard

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthState).pipe(
    map((authState) => {
      if (authState.uid) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
```

### 📝 Task Management

#### Firestore Structure

```
tasks/
  ├── {taskId1}/
  │   ├── id: string
  │   ├── title: string
  │   ├── description: string
  │   ├── status: 'todo' | 'in-progress' | 'done'
  │   ├── assigneeId: string
  │   ├── createdAt: Timestamp
  │   └── updatedAt: Timestamp
  │
  └── {taskId2}/
      └── ...
```

#### Task Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');

  // Lấy tất cả tasks
  getTasks(): Observable<Task[]> {
    return collectionData(this.tasksCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  // Thêm task mới
  addTask(taskData: Omit<Task, 'id'>): Observable<DocumentReference> {
    return from(
      addDoc(this.tasksCollection, {
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  }

  // Cập nhật task
  updateTask(task: Task): Observable<void> {
    const taskRef = doc(this.firestore, `tasks/${task.id}`);
    return from(updateDoc(taskRef, { ...task, updatedAt: new Date() }));
  }

  // Xóa task
  deleteTask(taskId: string): Observable<void> {
    const taskRef = doc(this.firestore, `tasks/${taskId}`);
    return from(deleteDoc(taskRef));
  }
}
```

#### Task Selectors (Memoized)

```typescript
export const selectTaskState = createFeatureSelector<TaskState>('tasks');

export const selectAllTasks = createSelector(selectTaskState, (state) => state.tasks);

export const selectTodoTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'todo')
);

export const selectInProgressTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'in-progress')
);

export const selectDoneTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'done')
);
```

### 🎨 Kanban Board Component

#### Component Logic

```typescript
@Component({
  selector: 'app-kanban-board',
  imports: [TaskCard, DragDropModule, CommonModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit {
  private store = inject(Store);

  // Subscribe to selectors
  todoTasks$: Observable<Task[]> = this.store.select(selectTodoTasks);
  inProgressTasks$: Observable<Task[]> = this.store.select(selectInProgressTasks);
  doneTasks$: Observable<Task[]> = this.store.select(selectDoneTasks);

  ngOnInit(): void {
    // Load tasks khi component khởi tạo
    this.store.dispatch(TaskActions.loadTasks());
  }

  // Xử lý drag & drop (sẽ implement sau)
  onDrop(event: CdkDragDrop<Task[]>) {
    // Update task status
  }
}
```

### 💾 State Persistence

#### LocalStorage Sync

```typescript
// app.config.ts
export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: ['auth'], // Chỉ persist auth state
    rehydrate: true, // Restore state khi reload
  })(reducer);
}

const metaReducers = [localStorageSyncReducer];

provideStore(
  { router: routerReducer, auth: authReducer, tasks: taskReducer, user: usersReducers },
  { metaReducers }
);
```

**Lợi ích**:

- User không bị logout khi refresh page
- Giữ session authentication
- Improve UX

---

## 5. CÁC VẤN ĐỀ ĐÃ GIẢI QUYẾT

### 🐛 Bug Tracking

| #   | Lỗi                                 | Nguyên nhân                      | Giải pháp                          | Bài học                          |
| --- | ----------------------------------- | -------------------------------- | ---------------------------------- | -------------------------------- |
| 1   | Cannot redeclare 'initialState'     | Khai báo biến trùng lặp          | Xóa duplicate                      | Kiểm tra scope của biến          |
| 2   | Property 'email' does not exist     | Không destructure action payload | Destructure đúng cú pháp           | Hiểu về action payload structure |
| 3   | Argument type 'void' not assignable | Truyền sai tham số               | Destructure và truyền đúng giá trị | Kiểm tra type của parameters     |
| 4   | Expected 1-2 arguments, got 3       | Sai cú pháp createEffect         | Sửa lại structure của effect       | Đọc kỹ docs về createEffect      |
| 5   | Cannot find name 'loadCompoent'     | Typo                             | Fix typo                           | Sử dụng TypeScript autocomplete  |
| 6   | Property 'isLoading$' not exist     | Naming mismatch                  | Đồng nhất naming                   | Consistent naming convention     |
| 7   | Task type collision                 | Zone.js global type conflict     | Explicit import                    | Hiểu về global types             |
| 8   | Type mismatch in addTask            | Truyền cả action object          | Destructure taskData               | Hiểu về action structure         |
| 9   | File casing error                   | Inconsistent file naming         | Rename file                        | Consistent naming convention     |
| 10  | User type mismatch                  | Firebase User vs Custom User     | Map data types                     | Type transformation              |

### 🎓 Lessons Learned

#### 1. **TypeScript Type Safety**

- Luôn kiểm tra types khi làm việc với actions
- Sử dụng explicit types thay vì `any`
- Hiểu về type inference và type guards

#### 2. **NgRx Best Practices**

- **Actions**: Nên có naming convention rõ ràng (verb + noun)

  ```typescript
  // Good
  loadTasks();
  loadTasksSuccess();
  loadTasksFailure();

  // Bad
  getTasks();
  tasksLoaded();
  error();
  ```

- **Effects**: Luôn handle cả success và error cases

  ```typescript
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
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

- **Reducers**: Immutable updates

  ```typescript
  on(TaskActions.addTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task], // ← Tạo array mới
  }));
  ```

- **Selectors**: Sử dụng memoization
  ```typescript
  // Selector sẽ chỉ re-compute khi tasks thay đổi
  export const selectTodoTasks = createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => task.status === 'todo')
  );
  ```

#### 3. **Firebase Integration**

- Luôn convert Promise sang Observable với `from()`
- Handle Firestore Timestamp properly
- Sử dụng `collectionData()` cho real-time updates

#### 4. **Debugging Strategies**

- Sử dụng Redux DevTools để track actions
- Console.log trong effects để debug flow
- Kiểm tra Network tab cho Firebase requests
- Đọc kỹ error messages - chúng rất helpful!

---

## 6. KIẾN THỨC ĐÃ HỌC

### 📚 Kiến thức Angular

#### 1. **Standalone Components**

```typescript
@Component({
  selector: 'app-login',
  standalone: true, // ← Không cần NgModule
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {}
```

#### 2. **Dependency Injection với inject()**

```typescript
// Old way
constructor(private store: Store) {}

// New way (Angular 14+)
private store = inject(Store);
```

#### 3. **Lazy Loading Routes**

```typescript
{
  path: 'board',
  loadComponent: () => import('./kanban/kanban-board/kanban-board')
    .then((m) => m.KanbanBoard),
  canActivate: [authGuard],
}
```

### 📚 Kiến thức NgRx

#### 1. **State Management Pattern**

```
Action → Reducer → State → Selector → Component
   ↓
Effect → Service → Backend
   ↓
Success/Failure Action → Reducer
```

#### 2. **RxJS Operators**

- `switchMap`: Cancel previous request, dùng cho search
- `mergeMap`: Không cancel, dùng cho independent requests
- `map`: Transform data
- `catchError`: Handle errors
- `tap`: Side effects không ảnh hưởng stream
- `of`: Tạo Observable từ value

#### 3. **Effect Patterns**

**Pattern 1: Simple Effect**

```typescript
loadData$ = createEffect(() =>
  this.actions$.pipe(
    ofType(DataActions.load),
    switchMap(() =>
      this.service.getData().pipe(
        map((data) => DataActions.loadSuccess({ data })),
        catchError((error) => of(DataActions.loadFailure({ error })))
      )
    )
  )
);
```

**Pattern 2: Effect with Navigation**

```typescript
logout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.logout),
    switchMap(() =>
      this.authService.logout().pipe(
        map(() => AuthActions.logoutSuccess()),
        tap(() => this.router.navigate(['/login']))
      )
    )
  )
);
```

**Pattern 3: Non-dispatching Effect**

```typescript
navigate$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/dashboard']))
    ),
  { dispatch: false } // ← Không dispatch action mới
);
```

**Pattern 4: Chain Effects**

```typescript
register$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.register),
    switchMap(({ email, password, name }) =>
      this.authService.register(email, password).pipe(
        mergeMap((userCred) =>
          // Chain: Tạo user doc sau khi register
          this.authService.createUserDocument(userCred.user.uid!, userCred.user.email!, name).pipe(
            map(() =>
              AuthActions.registerSuccess({
                uid: userCred.user.uid!,
                email: userCred.user.email!,
              })
            )
          )
        ),
        catchError((error) => of(AuthActions.registerFailure({ error })))
      )
    )
  )
);
```

### 📚 Kiến thức Firebase

#### 1. **Authentication**

```typescript
// Sign up
createUserWithEmailAndPassword(auth, email, password);

// Sign in
signInWithEmailAndPassword(auth, email, password);

// Sign out
signOut(auth);

// Get current user
auth.currentUser;
```

#### 2. **Firestore CRUD**

```typescript
// Create
addDoc(collection(firestore, 'tasks'), data);

// Read
collectionData(collection(firestore, 'tasks'));

// Update
updateDoc(doc(firestore, 'tasks', id), data);

// Delete
deleteDoc(doc(firestore, 'tasks', id));
```

#### 3. **Real-time Updates**

```typescript
// Firestore tự động sync khi data thay đổi
collectionData(this.tasksCollection, { idField: 'id' }).subscribe((tasks) => {
  // Tự động update khi có thay đổi trên server
});
```

---

## 7. KẾT LUẬN

### ✅ Những gì đã hoàn thành

#### Core Features

- ✅ Authentication (Login/Register/Logout)
- ✅ Auth Guard cho protected routes
- ✅ Task CRUD operations
- ✅ Kanban Board với 3 columns (Todo, In Progress, Done)
- ✅ User management
- ✅ State persistence với LocalStorage

#### Technical Implementation

- ✅ NgRx Store với 3 feature stores (Auth, Task, User)
- ✅ Firebase Authentication integration
- ✅ Cloud Firestore integration
- ✅ RxJS reactive programming
- ✅ TypeScript type safety
- ✅ Standalone components
- ✅ Lazy loading routes

#### Development Skills

- ✅ Debugging TypeScript errors
- ✅ Understanding NgRx patterns
- ✅ Working with Firebase
- ✅ State management best practices
- ✅ Error handling strategies

### 🚀 Những gì cần làm tiếp

#### Features

- ⏳ Drag & Drop functionality (Angular CDK đã setup)
- ⏳ Task filtering và sorting
- ⏳ Task search
- ⏳ User assignment UI
- ⏳ Task comments
- ⏳ Task attachments
- ⏳ Notifications
- ⏳ Dashboard analytics

#### Technical Improvements

- ⏳ Unit tests với Vitest
- ⏳ E2E tests
- ⏳ Error boundary
- ⏳ Loading states UI
- ⏳ Optimistic updates
- ⏳ Offline support
- ⏳ Performance optimization
- ⏳ Security rules cho Firestore

#### UI/UX

- ⏳ Responsive design
- ⏳ Dark mode
- ⏳ Animations
- ⏳ Toast notifications
- ⏳ Confirmation dialogs
- ⏳ Form validations UI

### 📊 Thống kê Dự án

- **Thời gian phát triển**: 7 ngày (24/12 - 30/12)
- **Số lỗi đã fix**: 10+ errors
- **Số files đã tạo**: 30+ files
- **Lines of code**: ~2000+ lines
- **Số conversations**: 20 conversations
- **Technologies mastered**: 5+ (Angular, NgRx, Firebase, TypeScript, RxJS)

### 💡 Kinh nghiệm Rút ra

#### 1. **Planning is Key**

- Thiết kế kiến trúc trước khi code
- Hiểu rõ data flow trước khi implement
- Đọc docs kỹ trước khi bắt đầu

#### 2. **Start Small, Iterate**

- Bắt đầu với features đơn giản (Auth)
- Test kỹ trước khi move sang feature khác
- Refactor khi cần thiết

#### 3. **Error Messages are Friends**

- Đọc kỹ error messages
- Google error messages
- Hiểu root cause thay vì quick fix

#### 4. **Documentation Matters**

- Viết comments cho code phức tạp
- Document decisions và trade-offs
- Maintain README và docs

#### 5. **Testing Early Saves Time**

- Test mỗi feature ngay sau khi implement
- Sử dụng Redux DevTools để debug
- Manual testing trước khi move on

### 🎯 Next Steps

#### Immediate (Tuần tới)

1. Implement Drag & Drop cho Kanban Board
2. Add task filtering và sorting
3. Improve UI/UX với loading states
4. Add form validations

#### Short-term (2-3 tuần)

1. Write unit tests
2. Implement task comments
3. Add user assignment UI
4. Create dashboard analytics

#### Long-term (1-2 tháng)

1. Mobile responsive design
2. Offline support
3. Real-time collaboration
4. Performance optimization
5. Deploy to production

---

## 📖 TÀI LIỆU THAM KHẢO

### Official Documentation

- [Angular Documentation](https://angular.dev)
- [NgRx Documentation](https://ngrx.io)
- [Firebase Documentation](https://firebase.google.com/docs)
- [RxJS Documentation](https://rxjs.dev)

### Tutorials & Guides

- NgRx Best Practices
- Firebase Security Rules
- Angular Performance Optimization
- TypeScript Advanced Types

### Tools

- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Angular DevTools](https://angular.io/guide/devtools)
- [Firebase Console](https://console.firebase.google.com)

---

## 🙏 KẾT

Đây là một hành trình học tập và phát triển rất bổ ích. Từ việc không biết gì về NgRx đến việc có thể tự tin implement một ứng dụng hoàn chỉnh với state management, authentication, và real-time database.

**Key Takeaways**:

- State management không khó như tưởng tượng
- TypeScript giúp catch bugs sớm
- Firebase làm backend development dễ dàng hơn rất nhiều
- Debugging skills quan trọng không kém coding skills
- Documentation và planning tiết kiệm thời gian

**Cảm ơn bản thân đã kiên trì và không bỏ cuộc khi gặp lỗi! 🎉**

---

_Tài liệu này được tạo ngày 30/12/2024_  
_Version: 1.0_  
_Author: [Your Name]_
