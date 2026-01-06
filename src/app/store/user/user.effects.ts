import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, withLatestFrom } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { UserActions } from './user.actions';
import { UserService } from './user.service';
import { selectCurrentUserId } from '../auth/auth.selector';

@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private usersService = inject(UserService);
  private store = inject(Store);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() =>
        this.usersService.getUsers().pipe(
          map((users) => UserActions.loadUsersSuccess({ users })),
          catchError((error) => of(UserActions.loadUsersFailure({ error: error.message })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      withLatestFrom(this.store.select(selectCurrentUserId)),
      mergeMap(([{ updates }, userId]) => {
        if (!userId) {
          return of(UserActions.updateUserFailure({ error: 'User not authenticated' }));
        }

        return this.usersService.updateUser(userId, updates).pipe(
          map(() => UserActions.updateUserSuccess({ user: { uid: userId, ...updates } as any })),
          catchError((error) => of(UserActions.updateUserFailure({ error: error.message })))
        );
      })
    )
  );
}
