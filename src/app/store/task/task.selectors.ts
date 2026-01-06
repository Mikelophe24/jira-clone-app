import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, TaskWithAssignee } from './task.model';
import { UserState } from '../user/user.model';
import { selectAllUsers } from '../user/user.selectors';
import { selectCurrentUserId } from '../auth/auth.selector';
import { selectCurrentProjectId } from '../project/project.selectors';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(selectTasksState, (state) => state.tasks);

//task
export const selectTaskWithAssigneeInfo = createSelector(
  selectAllTasks,
  selectAllUsers,
  (tasks, users): TaskWithAssignee[] => {
    const usersMap = new Map(users.map((user) => [user.uid, user.name]));

    return tasks.map((task, index) => ({
      ...task,
      taskNumber: task.taskNumber || index + 1,
      assigneeName: task.assigneeId ? usersMap.get(task.assigneeId) : undefined,
      reporterName: task.reporterId ? usersMap.get(task.reporterId) : 'Unknown',
    }));
  }
);

// --- TASKS BY CURRENT PROJECT ---
export const selectTasksByCurrentProject = createSelector(
  selectTaskWithAssigneeInfo,
  selectCurrentProjectId,
  (tasks, projectId) => {
    if (!projectId) return [];
    return tasks.filter((task) => task.projectId === projectId);
  }
);

export const selectTodoTasksByCurrentProject = createSelector(
  selectTasksByCurrentProject,
  (tasks) =>
    tasks.filter((task) => task.status === 'To Do').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectInProgressTasksByCurrentProject = createSelector(
  selectTasksByCurrentProject,
  (tasks) =>
    tasks
      .filter((task) => task.status === 'In Progress')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectDoneTasksByCurrentProject = createSelector(
  selectTasksByCurrentProject,
  (tasks) =>
    tasks.filter((task) => task.status === 'Done').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

// --- MY TASKS BY CURRENT PROJECT ---
export const selectMyTasksByCurrentProject = createSelector(
  selectTasksByCurrentProject,
  selectCurrentUserId,
  (tasks, currentUserId) => {
    if (!currentUserId) return [];
    return tasks.filter((task) => task.assigneeId === currentUserId);
  }
);

export const selectMyTodoTasksByCurrentProject = createSelector(
  selectMyTasksByCurrentProject,
  (tasks) =>
    tasks.filter((task) => task.status === 'To Do').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectMyInProgressTasksByCurrentProject = createSelector(
  selectMyTasksByCurrentProject,
  (tasks) =>
    tasks
      .filter((task) => task.status === 'In Progress')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectMyDoneTasksByCurrentProject = createSelector(
  selectMyTasksByCurrentProject,
  (tasks) =>
    tasks.filter((task) => task.status === 'Done').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

// --- OLD SELECTORS (Keeping for backward compatibility if needed, or can remove if sure) ---
// Note: The original ones below filtered ONLY by status, effectively returning tasks from ALL projects if not filtered further.
// If the app only shows one project at a time essentially, we rely on the container to filter.
// But safely, we should use the ByCurrentProject ones in the Kanban board.

export const selectTodoTasksWithAssignee = createSelector(selectTaskWithAssigneeInfo, (tasks) =>
  tasks.filter((task) => task.status === 'To Do').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectInProgressTasksWithAssignee = createSelector(
  selectTaskWithAssigneeInfo,
  (tasks) =>
    tasks
      .filter((task) => task.status === 'In Progress')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectDoneTasksWithAssignee = createSelector(selectTaskWithAssigneeInfo, (tasks) =>
  tasks.filter((task) => task.status === 'Done').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

export const selectMyTasks = createSelector(
  selectTaskWithAssigneeInfo,
  selectCurrentUserId,
  (tasks, currentUserId) => {
    if (!currentUserId) return [];
    return tasks.filter((task) => task.assigneeId === currentUserId);
  }
);
