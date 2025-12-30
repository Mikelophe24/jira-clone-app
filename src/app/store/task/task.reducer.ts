import { createReducer, on } from '@ngrx/store';
import { TaskState } from './task.model';
import { TaskActions } from './task.actions';

export const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

export const taskReducer = createReducer(
  initialState,

  // Load Tasks
  on(TaskActions.loadTasks, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    isLoading: false,
    error: null,
  })),
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Add Task
  on(TaskActions.addTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(TaskActions.addTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
    isLoading: false,
    error: null,
  })),
  on(TaskActions.addTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update Task
  on(TaskActions.updateTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
    isLoading: false,
    error: null,
  })),
  on(TaskActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Delete Task
  on(TaskActions.deleteTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(TaskActions.deleteTaskSuccess, (state, { taskId }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== taskId),
    isLoading: false,
    error: null,
  })),
  on(TaskActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }))
);
