import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions } from './store/auth/auth.actions';
import { selectIsLoggedIn } from './store/auth/auth.selector';
import { selectCurrentUserProfile } from './store/user/user.selectors';
import { UserActions } from './store/user/user.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  title = 'ngrx-jira-clone';

  private store = inject(Store);

  isLoggedIn$: Observable<boolean> = this.store.select(selectIsLoggedIn);
  currentUserProfile$ = this.store.select(selectCurrentUserProfile);

  ngOnInit() {
    this.store.dispatch(UserActions.loadUsers());
  }

  onLogout() {
    const isConfirm = confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (isConfirm) {
      this.store.dispatch(AuthActions.logout());
    }
  }
}
