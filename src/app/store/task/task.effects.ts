import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TaskService } from './task.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { TaskActions } from './task.actions';

@Injectable({
  providedIn: 'root',
})
export class TaskEffects {
  private action$ = inject(Actions);
  private taskService = inject(TaskService);

  loadTasks$ = createEffect(() =>
    this.action$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map((tasks) => {
            console.log('Tasks loaded from Firebase:', tasks);
            return TaskActions.loadTasksSuccess({ tasks });
          }),
          catchError((error) => {
            console.error('Failed to load tasks:', error);
            return of(TaskActions.loadTasksFailure({ error: error.message }));
          })
        )
      )
    )
  );

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
          catchError((error) => of(TaskActions.addTaskFailure({ error: error.message })))
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.action$.pipe(
      ofType(TaskActions.updateTask),
      switchMap(({ task }) =>
        this.taskService.updateTask(task).pipe(
          map(() => TaskActions.updateTaskSuccess({ task })),
          catchError((error) => of(TaskActions.updateTaskFailure({ error: error.message })))
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.action$.pipe(
      ofType(TaskActions.deleteTask),
      switchMap(({ taskId }) =>
        this.taskService.deleteTask(taskId).pipe(
          map(() => TaskActions.deleteTaskSuccess({ taskId })),
          catchError((error) => of(TaskActions.deleteTaskFailure({ error: error.message })))
        )
      )
    )
  );
}
