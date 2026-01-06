import { TaskWithAssignee } from '../store/task/task.model';

/**
 * Calculate new order value for a task using fractional indexing
 * This allows infinite insertions without updating all tasks
 *
 * @param tasks - Array of tasks in the target column (sorted by order)
 * @param targetIndex - Index where the task is being dropped
 * @param excludeTaskId - ID of task being moved (to exclude from calculation in same-column reorder)
 * @returns New order value
 */
export function calculateNewOrder(
  tasks: TaskWithAssignee[],
  targetIndex: number,
  excludeTaskId?: string
): number {
  // Filter out the task being moved (for same-column reorder)
  const filteredTasks = excludeTaskId ? tasks.filter((t) => t.id !== excludeTaskId) : tasks;

  // If dropping into an empty list
  if (filteredTasks.length === 0) {
    return 1000;
  }

  // If dropping at the beginning
  if (targetIndex === 0) {
    const firstOrder = filteredTasks[0]?.order ?? 1000;
    return firstOrder - 1000;
  }

  // If dropping at the end
  if (targetIndex >= filteredTasks.length) {
    const lastOrder = filteredTasks[filteredTasks.length - 1]?.order ?? 0;
    return lastOrder + 1000;
  }

  // If dropping in the middle - use average of surrounding tasks
  const prevOrder = filteredTasks[targetIndex - 1]?.order ?? 0;
  const nextOrder = filteredTasks[targetIndex]?.order ?? prevOrder + 2000;
  return (prevOrder + nextOrder) / 2;
}
