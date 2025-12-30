import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState } from './task.model';

export const selectTasksState = createFeatureSelector<TaskState>('tasks');

export const selectAllTasks = createSelector(selectTasksState, (state) => state.tasks);

export const selectTodoTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'To do')
);

export const selectInProgressTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'In progress')
);

export const selectDoneTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'Done')
);
