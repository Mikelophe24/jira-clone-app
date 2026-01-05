import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { selectAuthState } from '../../store/auth/auth.selector';
import { AuthActions } from '../../store/auth/auth.actions';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private store = inject(Store);

  name = '';
  email = '';
  password = '';

  isLoading$: Observable<boolean> = this.store
    .select(selectAuthState)
    .pipe(map((s) => s.isLoading));
  error$: Observable<string | null> = this.store.select(selectAuthState).pipe(map((s) => s.error));

  onSubmit(): void {
    this.store.dispatch(
      AuthActions.register({
        name: this.name,
        email: this.email,
        password: this.password,
      })
    );
  }
}
