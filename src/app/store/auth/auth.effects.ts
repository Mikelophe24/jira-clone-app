import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from './auth.service';
import { AuthActions } from './auth.actions';
import { map, switchMap, catchError, mergeMap, tap } from 'rxjs';
import { of } from 'rxjs';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((userCred) =>
            AuthActions.loginSuccess({
              uid: userCred.user.uid!,
              email: userCred.user.email!,
            })
          ),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, password, name }) =>
        this.authService.register(email, password).pipe(
          mergeMap((userCred) =>
            this.authService
              .createUserDocument(userCred.user.uid!, userCred.user.email!, name)
              .pipe(
                map(() =>
                  AuthActions.registerSuccess({
                    uid: userCred.user.uid!,
                    email: userCred.user.email!,
                  })
                ),
                catchError((error) => of(AuthActions.registerFailure({ error: error.message })))
              )
          ),
          catchError((error) => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

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

  authSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );
}
