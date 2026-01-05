# Drag & Drop Task Ordering

## Overview

This document explains how task ordering works in the Jira Clone application, including both cross-column movement and within-column reordering.

## Features

### 1. **Cross-Column Drag & Drop**

- Drag tasks between different status columns (To Do, In Progress, Done)
- Automatically updates task status
- Calculates new order based on drop position

### 2. **Within-Column Reordering**

- Drag tasks up and down within the same column
- Maintains order without changing status
- Smooth visual feedback during drag

## Implementation Details

### Task Model

```typescript
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  reporterId: string;
  assigneeId?: string;
  priority?: 'High' | 'Medium' | 'Low';
  order?: number; // For ordering tasks within a column
}
```

### Order Calculation Algorithm

The `calculateNewOrder()` method uses a **fractional indexing** approach:

```typescript
private calculateNewOrder(tasks: TaskWithAssignee[], targetIndex: number): number {
  if (tasks.length === 0) return 1000;

  // If dropping at the beginning
  if (targetIndex === 0) {
    const firstOrder = tasks[0]?.order ?? 1000;
    return firstOrder - 1000;
  }

  // If dropping at the end
  if (targetIndex >= tasks.length) {
    const lastOrder = tasks[tasks.length - 1]?.order ?? 0;
    return lastOrder + 1000;
  }

  // If dropping in the middle
  const prevOrder = tasks[targetIndex - 1]?.order ?? 0;
  const nextOrder = tasks[targetIndex]?.order ?? prevOrder + 2000;
  return (prevOrder + nextOrder) / 2;
}
```

#### Algorithm Explanation:

1. **Empty List**: Returns 1000 as default
2. **Drop at Beginning**: `firstOrder - 1000`
3. **Drop at End**: `lastOrder + 1000`
4. **Drop in Middle**: Average of previous and next orders `(prevOrder + nextOrder) / 2`

This approach allows for:

- ✅ Infinite insertions between any two tasks
- ✅ No need to update all tasks when reordering
- ✅ Efficient database updates (only one task updated per drag)

### Default Order for New Tasks

When creating a new task:

```typescript
order: Date.now(); // Use timestamp as default order
```

This ensures new tasks always appear at the end of their column.

### Sorting in Selectors

Tasks are sorted by order in the selectors:

```typescript
export const selectTodoTasksWithAssignee = createSelector(selectTaskWithAssigneeInfo, (tasks) =>
  tasks.filter((task) => task.status === 'To Do').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);
```

## Drag & Drop Flow

### Scenario 1: Reordering within same column

```
User drags task from position 2 to position 0
↓
onDrop() detects same container
↓
calculateNewOrder() computes new order value
↓
Dispatch updateTask with new order
↓
Firestore updates task.order
↓
UI automatically re-renders with new order
```

### Scenario 2: Moving to different column

```
User drags task from "To Do" to "In Progress"
↓
onDrop() detects different container
↓
Get new status from container ID
↓
calculateNewOrder() computes new order value
↓
Dispatch updateTask with new status AND order
↓
Firestore updates task.status and task.order
↓
UI automatically re-renders in new column
```

## CDK Drag & Drop Configuration

### HTML Template

```html
<div class="board-container" cdkDropListGroup>
  <div class="column">
    <div
      id="todo-list"
      class="task-list"
      cdkDropList
      [cdkDropListData]="(todoTasks$ | async) || []"
      (cdkDropListDropped)="onDrop($event)"
    >
      <app-task-card
        *ngFor="let task of todoTasks$ | async; trackBy: trackByTask"
        [task]="task"
        cdkDrag
      ></app-task-card>
    </div>
  </div>
</div>
```

### Key Directives:

- `cdkDropListGroup`: Groups all drop lists together
- `cdkDropList`: Marks container as droppable
- `cdkDropListData`: Binds data array to drop list
- `cdkDrag`: Makes individual items draggable

## Firestore Rules

The `order` field is optional in Firestore rules:

```javascript
function isValidTaskData(data) {
  return data.keys().hasAll(['title', 'description', 'status', 'reporterId']) &&
         // ... other validations ...
         (!('order' in data) || data.order is number);
}
```

## Migration Strategy

For existing tasks without an `order` field:

1. Tasks without order will default to `0` in sorting
2. First drag operation will assign proper order
3. No manual migration needed

## Performance Considerations

### Optimizations:

- ✅ Only updates single task on drag
- ✅ No cascade updates needed
- ✅ Efficient fractional indexing
- ✅ Firestore real-time updates

### Potential Issues:

- ⚠️ After many operations, order values might become very large or very small
- 💡 Solution: Implement periodic "rebalancing" if needed (not currently implemented)

## Testing Scenarios

1. **Drag task to top of column**

   - Expected: Task appears first
   - Order should be less than previous first task

2. **Drag task to bottom of column**

   - Expected: Task appears last
   - Order should be greater than previous last task

3. **Drag task between two tasks**

   - Expected: Task appears between them
   - Order should be average of surrounding tasks

4. **Drag task to different column**

   - Expected: Task changes status and maintains position
   - Both status and order should update

5. **Create new task**
   - Expected: Task appears at bottom
   - Order should be timestamp value

## Future Enhancements

Potential improvements:

- [ ] Add animation duration configuration
- [ ] Implement order rebalancing algorithm
- [ ] Add keyboard shortcuts for reordering
- [ ] Persist drag preferences
- [ ] Add undo/redo for drag operations
