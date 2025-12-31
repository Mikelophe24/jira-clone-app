import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, TaskWithAssignee } from './task.model';
import { UserState } from '../user/user.model';
import { selectAllUsers } from '../user/user.selectors';
import { selectCurrentUserId } from '../auth/auth.selector';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(selectTasksState, (state) => state.tasks);

//task
export const selectTaskWithAssigneeInfo = createSelector(
  selectAllTasks,
  selectAllUsers,
  (tasks, users): TaskWithAssignee[] => {
    const usersMap = new Map(users.map((user) => [user.uid, user.name]));

    return tasks.map((task) => ({
      ...task,
      assigneeName: task.assigneeId ? usersMap.get(task.assigneeId) : undefined,
    }));
  }
);

export const selectTodoTasksWithAssignee = createSelector(selectTaskWithAssigneeInfo, (tasks) =>
  tasks.filter((task) => task.status === 'To Do')
);

export const selectInProgressTasksWithAssignee = createSelector(
  selectTaskWithAssigneeInfo,
  (tasks) => tasks.filter((task) => task.status === 'In Progress')
);

export const selectDoneTasksWithAssignee = createSelector(selectTaskWithAssigneeInfo, (tasks) =>
  tasks.filter((task) => task.status === 'Done')
);

export const selectMyTasks = createSelector(
  selectTaskWithAssigneeInfo,
  selectCurrentUserId,
  (tasks, currentUserId) => {
    if (!currentUserId) return [];
    return tasks.filter((task) => task.assigneeId === currentUserId);
  }
);
