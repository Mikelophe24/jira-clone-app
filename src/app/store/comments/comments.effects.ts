import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { CommentsActions } from './comments.actions';
import { TaskService } from '../task/task.service';
import { selectUser } from '../auth/auth.selector';

@Injectable()
export class CommentsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private taskService = inject(TaskService);

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.loadComments),
      switchMap(({ taskId }) =>
        this.taskService.getComments(taskId).pipe(
          map((comments) => CommentsActions.loadCommentsSuccess({ comments })),
          catchError((error) => of(CommentsActions.loadCommentsFailure({ error: error.message })))
        )
      )
    )
  );

  addComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.addComment),
      withLatestFrom(this.store.select(selectUser)),
      switchMap(([{ taskId, content }, user]) => {
        //
        if (!user?.uid || !user?.email) return of({ type: '[comments] User not logged IN' });
        return this.taskService
          .addComment(taskId, content, { uid: user.uid, email: user.email, name: 'User Name' })
          .pipe(
            map(() => ({ type: '[comments] add comment successfull' })),
            catchError((error) => of(CommentsActions.addCommentFailure({ error: error.message })))
          );
      })
    )
  );
}
