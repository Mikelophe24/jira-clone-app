import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions } from './store/auth/auth.action';
import { selectIsLoggedIn } from './store/auth/auth.selector';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'ngrx-jira-clone';

  private store = inject(Store);

  isLoggedIn$: Observable<boolean> = this.store.select(selectIsLoggedIn);

  onLogout() {
    const isConfirm = confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (isConfirm) {
      this.store.dispatch(AuthActions.logout());
    }
  }
}
