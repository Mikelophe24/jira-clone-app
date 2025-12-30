import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Task } from './task.model';

export const TaskActions = createActionGroup({
  source: 'Tasks',
  events: {
    // Load Tasks
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ tasks: Task[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),

    // Add Task
    'Add Task': props<{ taskData: Omit<Task, 'id'> }>(),
    'Add Task Success': props<{ task: Task }>(),
    'Add Task Failure': props<{ error: string }>(),

    // Update Task
    'Update Task': props<{ task: Partial<Task> & { id: string } }>(),
    'Update Task Success': props<{ task: Partial<Task> & { id: string } }>(),
    'Update Task Failure': props<{ error: string }>(),

    // Delete Task
    'Delete Task': props<{ taskId: string }>(),
    'Delete Task Success': props<{ taskId: string }>(),
    'Delete Task Failure': props<{ error: string }>(),
  },
});
