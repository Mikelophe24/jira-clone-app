import { Component, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { selectAuthState } from '../../store/auth/auth.selector';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private store = inject(Store);

  //form

  email = '';
  password = '';

  // error & isLoading
  isLoading$: Observable<boolean> = this.store
    .select(selectAuthState)
    .pipe(map((loadingState) => loadingState.isLoading));

  error$: Observable<string | null> = this.store
    .select(selectAuthState)
    .pipe(map((errorMessage) => errorMessage.error));

  onSubmit() {
    this.store.dispatch(AuthActions.login({ email: this.email, password: this.password }));
  }
}
