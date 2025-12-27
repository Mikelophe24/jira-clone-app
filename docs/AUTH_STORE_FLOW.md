# 🔐 HƯỚNG DẪN CHI TIẾT LUỒNG HOẠT ĐỘNG AUTH STORE

## 📋 MỤC LỤC

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Các thành phần chính](#các-thành-phần-chính)
3. [Luồng đăng nhập (Login)](#luồng-đăng-nhập-login)
4. [Luồng đăng ký (Register)](#luồng-đăng-ký-register)
5. [Luồng đăng xuất (Logout)](#luồng-đăng-xuất-logout)
6. [Cách sử dụng trong Component](#cách-sử-dụng-trong-component)
7. [Các bước tiếp theo](#các-bước-tiếp-theo)

---

## 🏗️ TỔNG QUAN KIẾN TRÚC

NgRx Store hoạt động theo mô hình **Redux Pattern** với luồng dữ liệu một chiều:

```
┌──────────────────────────────────────────────────────────────────┐
│                        NGRX STORE FLOW                           │
└──────────────────────────────────────────────────────────────────┘

    Component                Action                 Effect
        │                      │                      │
        │  1. Dispatch         │                      │
        │─────────────────────>│                      │
        │                      │  2. Trigger Effect   │
        │                      │─────────────────────>│
        │                      │                      │
        │                      │                      │  3. Call API
        │                      │                      │────────────┐
        │                      │                      │            │
        │                      │                      │<───────────┘
        │                      │  4. Dispatch Success │
        │                      │<─────────────────────│
        │                      │     or Failure       │
        │                      │                      │
        │                      ▼                      │
        │                   Reducer                   │
        │                      │                      │
        │                      │  5. Update State     │
        │                      ▼                      │
        │                    Store                    │
        │                      │                      │
        │  6. Auto Update      │                      │
        │<─────────────────────│                      │
        │   (via Selector)     │                      │
        │                      │                      │
```

---

## 📦 CÁC THÀNH PHẦN CHÍNH

### 1️⃣ **auth.model.ts** - Định nghĩa cấu trúc dữ liệu

```typescript
export interface AuthState {
  uid: string | null; // ID người dùng từ Firebase
  email: string | null; // Email người dùng
  error: string | null; // Thông báo lỗi
  isLoading: boolean; // Trạng thái loading
}
```

**Vai trò:** Blueprint (bản thiết kế) của State

**Các trạng thái có thể:**

- ✅ Chưa đăng nhập: `{ uid: null, email: null, isLoading: false, error: null }`
- ⏳ Đang xử lý: `{ uid: null, email: null, isLoading: true, error: null }`
- ✅ Đã đăng nhập: `{ uid: "abc123", email: "user@gmail.com", isLoading: false, error: null }`
- ❌ Có lỗi: `{ uid: null, email: null, isLoading: false, error: "Invalid credentials" }`

---

### 2️⃣ **auth.action.ts** - Định nghĩa các hành động

```typescript
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login Actions
    Login: props<{ email: string; password: string }>(),
    'Login Success': props<{ uid: string; email: string }>(),
    'Login Failure': props<{ error: string }>(),

    // Register Actions
    Register: props<{ email: string; password: string; name: string }>(),
    'Register Success': props<{ uid: string; email: string }>(),
    'Register Failure': props<{ error: string }>(),

    // Logout Actions
    Logout: emptyProps(),
    'Logout Success': emptyProps(),
  },
});
```

**Vai trò:** Định nghĩa "menu lệnh" - tất cả hành động có thể xảy ra

**Các loại Action:**

| Action             | Khi nào trigger?         | Payload                     |
| ------------------ | ------------------------ | --------------------------- |
| `Login`            | User click nút đăng nhập | `{ email, password }`       |
| `Login Success`    | API login thành công     | `{ uid, email }`            |
| `Login Failure`    | API login thất bại       | `{ error }`                 |
| `Register`         | User click nút đăng ký   | `{ email, password, name }` |
| `Register Success` | API register thành công  | `{ uid, email }`            |
| `Register Failure` | API register thất bại    | `{ error }`                 |
| `Logout`           | User click đăng xuất     | (không có)                  |
| `Logout Success`   | Đăng xuất thành công     | (không có)                  |

---

### 3️⃣ **auth.reducer.ts** - Xử lý logic cập nhật State

```typescript
export const authReducer = createReducer(
  initialState,

  // Khi bắt đầu Login hoặc Register
  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  // Khi Login/Register thành công
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { uid, email }) => ({
    ...state,
    isLoading: false,
    uid,
    email,
    error: null,
  })),

  // Khi Login/Register thất bại
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Khi Logout thành công
  on(AuthActions.logoutSuccess, () => initialState)
);
```

**Vai trò:** "Bộ não" - nhận Action và tính toán State mới

**Nguyên tắc:**

- ✅ **Pure Function** - không side effects
- ✅ **Immutable** - không thay đổi state cũ, luôn tạo object mới
- ✅ **Synchronous** - xử lý đồng bộ

---

### 4️⃣ **auth.selector.ts** - Lấy dữ liệu từ Store

```typescript
// Lấy toàn bộ auth state
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Kiểm tra đã đăng nhập chưa
export const selectIsLoggedIn = createSelector(selectAuthState, (state) => !!state.uid);

// Lấy thông tin user
export const selectUser = createSelector(selectAuthState, (state) => ({
  uid: state.uid,
  email: state.email,
}));

// Lấy user ID
export const selectCurrentUserId = createSelector(selectAuthState, (state) => state.uid);
```

**Vai trò:** "Cửa sổ" để nhìn vào Store

**Ưu điểm:**

- ✅ **Memoization** - cache kết quả, chỉ tính lại khi cần
- ✅ **Reusable** - dùng lại nhiều nơi
- ✅ **Composable** - kết hợp nhiều selector

---

### 5️⃣ **auth.service.ts** - Gọi API Firebase

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  private fireStore: Firestore = inject(Firestore);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: any, password: any) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    return from(signOut(this.auth));
  }
}
```

**Vai trò:** Giao tiếp với Firebase Authentication

**Lưu ý:**

- Chuyển Promise → Observable bằng `from()`
- Sẽ được gọi từ **Effects** (chưa tạo)

---

### 6️⃣ **auth.effects.ts** - Xử lý side effects (CẦN TẠO)

```typescript
// File này bạn cần tạo tiếp theo!
@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  // Effect xử lý Login
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((userCredential) =>
            AuthActions.loginSuccess({
              uid: userCredential.user.uid,
              email: userCredential.user.email!,
            })
          ),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  // Effect xử lý Register
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, password }) =>
        this.authService.register(email, password).pipe(
          map((userCredential) =>
            AuthActions.registerSuccess({
              uid: userCredential.user.uid,
              email: userCredential.user.email!,
            })
          ),
          catchError((error) => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  // Effect xử lý Logout
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    )
  );

  // Redirect sau khi login/register thành công
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  // Redirect sau khi logout
  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.router.navigate(['/login']))
      ),
    { dispatch: false }
  );
}
```

**Vai trò:** Xử lý các tác vụ bất đồng bộ (API calls, routing, localStorage...)

---

## 🔄 LUỒNG ĐĂNG NHẬP (LOGIN)

### **Bước 1: User nhập thông tin và click "Đăng nhập"**

```typescript
// login.component.ts
export class LoginComponent {
  constructor(private store: Store) {}

  onLogin() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    // Dispatch action
    this.store.dispatch(AuthActions.login({ email, password }));
  }
}
```

**State hiện tại:**

```json
{ "uid": null, "email": null, "isLoading": false, "error": null }
```

---

### **Bước 2: Action được dispatch**

```typescript
AuthActions.login({
  email: 'user@gmail.com',
  password: '123456',
});
```

**Action này đi đến 2 nơi:**

1. ✅ **Reducer** - cập nhật `isLoading = true`
2. ✅ **Effect** - lắng nghe và xử lý

---

### **Bước 3: Reducer cập nhật State (lần 1)**

```typescript
on(AuthActions.login, (state) => ({
  ...state,
  isLoading: true, // ← Bật loading
  error: null, // ← Xóa lỗi cũ
}));
```

**State mới:**

```json
{ "uid": null, "email": null, "isLoading": true, "error": null }
```

**UI tự động cập nhật:** Hiện loading spinner

---

### **Bước 4: Effect gọi API Firebase**

```typescript
login$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.login), // ← Lắng nghe action Login
    switchMap(({ email, password }) =>
      this.authService.login(email, password).pipe(
        // ← Gọi API
        map((userCredential) =>
          AuthActions.loginSuccess({
            // ← Thành công
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
          })
        ),
        catchError(
          (error) => of(AuthActions.loginFailure({ error: error.message })) // ← Thất bại
        )
      )
    )
  )
);
```

---

### **Bước 5A: API thành công → Dispatch `loginSuccess`**

```typescript
AuthActions.loginSuccess({
  uid: 'abc123',
  email: 'user@gmail.com',
});
```

---

### **Bước 6A: Reducer cập nhật State (lần 2)**

```typescript
on(AuthActions.loginSuccess, (state, { uid, email }) => ({
  ...state,
  isLoading: false, // ← Tắt loading
  uid, // ← Lưu uid
  email, // ← Lưu email
  error: null,
}));
```

**State mới:**

```json
{
  "uid": "abc123",
  "email": "user@gmail.com",
  "isLoading": false,
  "error": null
}
```

---

### **Bước 7A: Effect redirect đến dashboard**

```typescript
loginSuccess$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/dashboard'])) // ← Chuyển trang
    ),
  { dispatch: false }
);
```

---

### **Bước 8A: UI tự động cập nhật**

```html
<!-- header.component.html -->
<div *ngIf="isLoggedIn$ | async">
  Xin chào, {{ (user$ | async)?.email }}!
  <button (click)="logout()">Đăng xuất</button>
</div>
```

**Kết quả:**

- ✅ Ẩn loading spinner
- ✅ Hiện "Xin chào, user@gmail.com!"
- ✅ Chuyển sang trang dashboard

---

### **HOẶC Bước 5B: API thất bại → Dispatch `loginFailure`**

```typescript
AuthActions.loginFailure({
  error: 'The password is invalid or the user does not have a password.',
});
```

---

### **Bước 6B: Reducer cập nhật State (lần 2)**

```typescript
on(AuthActions.loginFailure, (state, { error }) => ({
  ...state,
  isLoading: false, // ← Tắt loading
  error, // ← Lưu lỗi
}));
```

**State mới:**

```json
{
  "uid": null,
  "email": null,
  "isLoading": false,
  "error": "The password is invalid or the user does not have a password."
}
```

---

### **Bước 7B: UI tự động cập nhật**

```html
<!-- login.component.html -->
<div *ngIf="error$ | async as error" class="error-message">{{ error }}</div>
```

**Kết quả:**

- ✅ Ẩn loading spinner
- ✅ Hiện thông báo lỗi màu đỏ
- ✅ Ở lại trang login

---

## 📝 LUỒNG ĐĂNG KÝ (REGISTER)

Tương tự như Login, nhưng:

```typescript
// 1. Component dispatch
this.store.dispatch(
  AuthActions.register({
    email,
    password,
    name,
  })
);

// 2. Reducer cập nhật isLoading = true

// 3. Effect gọi API
this.authService.register(email, password);

// 4. Thành công → registerSuccess
// 5. Thất bại → registerFailure

// 6. Reducer cập nhật State

// 7. Effect redirect hoặc hiện lỗi
```

**Lưu ý:** Sau khi register thành công, bạn có thể cần:

- Lưu thêm thông tin `name` vào Firestore
- Gửi email xác thực
- Tạo document user trong database

---

## 🚪 LUỒNG ĐĂNG XUẤT (LOGOUT)

### **Bước 1: User click "Đăng xuất"**

```typescript
// header.component.ts
logout() {
  this.store.dispatch(AuthActions.logout());
}
```

---

### **Bước 2: Effect gọi API Firebase**

```typescript
logout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.logout),
    switchMap(() => this.authService.logout().pipe(map(() => AuthActions.logoutSuccess())))
  )
);
```

---

### **Bước 3: Reducer reset State về ban đầu**

```typescript
on(AuthActions.logoutSuccess, () => initialState);
```

**State mới:**

```json
{ "uid": null, "email": null, "isLoading": false, "error": null }
```

---

### **Bước 4: Effect redirect về login**

```typescript
logoutSuccess$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => this.router.navigate(['/login']))
    ),
  { dispatch: false }
);
```

---

## 💻 CÁCH SỬ DỤNG TRONG COMPONENT

### **1. Login Component**

```typescript
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from './store/auth/auth.action';

@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
      <input formControlName="email" placeholder="Email" />
      <input formControlName="password" type="password" placeholder="Password" />

      <button type="submit" [disabled]="isLoading$ | async">
        <span *ngIf="!(isLoading$ | async)">Đăng nhập</span>
        <span *ngIf="isLoading$ | async">Đang xử lý...</span>
      </button>

      <div *ngIf="error$ | async as error" class="error">
        {{ error }}
      </div>
    </form>
  `,
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: [''],
    password: [''],
  });

  // Lấy dữ liệu từ Store
  isLoading$ = this.store.select((state) => state.auth.isLoading);
  error$ = this.store.select((state) => state.auth.error);

  constructor(private store: Store<{ auth: AuthState }>, private fb: FormBuilder) {}

  onLogin() {
    const { email, password } = this.loginForm.value;
    this.store.dispatch(AuthActions.login({ email, password }));
  }
}
```

---

### **2. Header Component**

```typescript
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUser } from './store/auth/auth.selectors';
import { AuthActions } from './store/auth/auth.action';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <div *ngIf="isLoggedIn$ | async; else notLoggedIn">
        <span>Xin chào, {{ (user$ | async)?.email }}</span>
        <button (click)="logout()">Đăng xuất</button>
      </div>

      <ng-template #notLoggedIn>
        <a routerLink="/login">Đăng nhập</a>
        <a routerLink="/register">Đăng ký</a>
      </ng-template>
    </header>
  `,
})
export class HeaderComponent {
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
```

---

### **3. Auth Guard (Bảo vệ routes)**

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from './store/auth/auth.selectors';
import { map } from 'rxjs/operators';

export const authGuard = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsLoggedIn).pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};

// Sử dụng trong routes
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // ← Bảo vệ route
  },
];
```

---

## 🎯 CÁC BƯỚC TIẾP THEO

### **1. Tạo Auth Effects**

```bash
# Tạo file auth.effects.ts
```

Nội dung như đã mô tả ở phần 6️⃣ ở trên.

---

### **2. Đăng ký Store trong app.config.ts**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ auth: authReducer }), // ← Đăng ký reducer
    provideEffects([AuthEffects]), // ← Đăng ký effects
    // ... các providers khác
  ],
};
```

---

### **3. Cài đặt NgRx DevTools (để debug)**

```bash
npm install @ngrx/store-devtools
```

```typescript
// app.config.ts
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25 }), // ← DevTools
  ],
};
```

---

### **4. Tạo Login/Register Components**

```bash
ng generate component pages/login
ng generate component pages/register
```

---

### **5. Tạo Auth Guard**

```bash
ng generate guard guards/auth
```

---

## 🐛 DEBUG VỚI REDUX DEVTOOLS

1. Cài extension **Redux DevTools** cho Chrome/Firefox
2. Mở DevTools → Tab **Redux**
3. Xem:
   - **Actions**: Tất cả actions đã dispatch
   - **State**: State hiện tại
   - **Diff**: Sự thay đổi của state
   - **Time Travel**: Quay lại state trước đó

**Ví dụ:**

```
Action: [Auth] Login
Payload: { email: "user@gmail.com", password: "******" }

State Before:
{ uid: null, email: null, isLoading: false, error: null }

State After:
{ uid: null, email: null, isLoading: true, error: null }
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU KHI DÙNG NGRX

### ❌ **TRƯỚC (Không dùng NgRx)**

```typescript
// Dữ liệu rải rác nhiều nơi
export class LoginComponent {
  currentUser: User | null = null;

  login() {
    this.authService.login(email, password).subscribe((user) => {
      this.currentUser = user; // Lưu ở component
      localStorage.setItem('user', JSON.stringify(user)); // Lưu ở localStorage
      this.userService.setUser(user); // Lưu ở service
    });
  }
}

// Mỗi component phải tự lấy dữ liệu
export class HeaderComponent {
  ngOnInit() {
    this.currentUser = this.userService.getUser(); // Có thể bị out-of-sync
  }
}
```

**Vấn đề:**

- 🔴 Dữ liệu không đồng bộ
- 🔴 Khó debug
- 🔴 Khó test
- 🔴 Code lặp lại nhiều

---

### ✅ **SAU (Dùng NgRx)**

```typescript
// Component chỉ dispatch action
export class LoginComponent {
  login() {
    this.store.dispatch(AuthActions.login({ email, password }));
  }
}

// Mọi component tự động nhận dữ liệu mới
export class HeaderComponent {
  user$ = this.store.select(selectUser); // Luôn đồng bộ
}
```

**Ưu điểm:**

- ✅ **Single Source of Truth** - 1 nguồn dữ liệu duy nhất
- ✅ **Predictable** - Dễ dự đoán state
- ✅ **Debuggable** - Dễ debug với DevTools
- ✅ **Testable** - Dễ test
- ✅ **Scalable** - Dễ mở rộng

---

## 🎓 TÓM TẮT

### **Luồng hoạt động tổng quát:**

```
1. Component dispatch Action
         ↓
2. Reducer cập nhật State (isLoading = true)
         ↓
3. UI tự động cập nhật (hiện loading)
         ↓
4. Effect lắng nghe Action → Gọi API
         ↓
5. API trả về kết quả
         ↓
6. Effect dispatch Action mới (Success/Failure)
         ↓
7. Reducer cập nhật State (lưu data hoặc error)
         ↓
8. UI tự động cập nhật (hiện data hoặc error)
         ↓
9. Effect xử lý side-effect (redirect, notification...)
```

### **Nguyên tắc vàng:**

1. ✅ **Actions** - Mô tả "cái gì xảy ra"
2. ✅ **Reducers** - Mô tả "state thay đổi như thế nào"
3. ✅ **Effects** - Xử lý "side effects" (API, routing...)
4. ✅ **Selectors** - Lấy dữ liệu từ Store
5. ✅ **State** - Immutable, chỉ thay đổi qua Reducers

---

## 🚀 NEXT STEPS

1. ✅ Đã tạo: Model, Actions, Reducer, Selectors, Service
2. ⏳ **Cần tạo tiếp:** Effects
3. ⏳ **Cần đăng ký:** Store trong app.config.ts
4. ⏳ **Cần tạo:** Login/Register Components
5. ⏳ **Cần tạo:** Auth Guard

---

## 📚 TÀI LIỆU THAM KHẢO

- [NgRx Official Docs](https://ngrx.io/)
- [Redux Pattern](https://redux.js.org/understanding/thinking-in-redux/three-principles)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [Angular Firebase](https://firebase.google.com/docs/auth/web/start)

---

**Chúc bạn học tốt! 🎉**

Nếu có thắc mắc, hãy hỏi ngay nhé! 😊
