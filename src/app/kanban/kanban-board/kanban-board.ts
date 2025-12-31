import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { Task, TaskWithAssignee } from '../../store/task/task.model';
import { TaskActions } from '../../store/task/task.actions';
import { UserActions } from '../../store/user/user.actions';
import { TaskCard } from '../task-card/task-card';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AddEditTaskComponent } from '../add-edit-task/add-edit-task';
import {
  selectDoneTasksWithAssignee,
  selectInProgressTasksWithAssignee,
  selectMyTasks,
  selectTodoTasksWithAssignee,
} from '../../store/task/task.selectors';
import { selectAllUsers } from '../../store/user/user.selectors';
import { User } from '../../store/user/user.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-kanban-board',
  imports: [TaskCard, DragDropModule, CommonModule, AddEditTaskComponent, FormsModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit {
  private store = inject(Store);

  users$: Observable<User[]> = this.store.select(selectAllUsers);

  allTodoTasks$: Observable<TaskWithAssignee[]> = this.store.select(selectTodoTasksWithAssignee);
  allInProgressTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectInProgressTasksWithAssignee
  );
  allDoneTasks$: Observable<TaskWithAssignee[]> = this.store.select(selectDoneTasksWithAssignee);

  myTodoTasks$: Observable<TaskWithAssignee[]> = this.store
    .select(selectMyTasks)
    .pipe(map((tasks) => tasks.filter((t) => t.status === 'To Do')));
  myInProgressTasks$: Observable<TaskWithAssignee[]> = this.store
    .select(selectMyTasks)
    .pipe(map((tasks) => tasks.filter((t) => t.status === 'In Progress')));
  myDoneTasks$: Observable<TaskWithAssignee[]> = this.store
    .select(selectMyTasks)
    .pipe(map((tasks) => tasks.filter((t) => t.status === 'Done')));

  // Filters UI State
  isFilterOpen = false;
  activeFilterCategory: 'assignee' | 'status' | 'priority' = 'status'; // Default tab

  // Filters Data
  priorities = ['High', 'Medium', 'Low'];
  statuses = ['To Do', 'In Progress', 'Done'];

  private filterModeSubject = new BehaviorSubject<'all' | 'my'>('all');
  filterMode$ = this.filterModeSubject.asObservable();

  searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  // Multi-select filters (Empty array = Select All)
  priorityFilterSubject = new BehaviorSubject<string[]>([]);
  priorityFilter$ = this.priorityFilterSubject.asObservable();

  assigneeFilterSubject = new BehaviorSubject<string[]>([]);
  assigneeFilter$ = this.assigneeFilterSubject.asObservable();

  statusFilterSubject = new BehaviorSubject<string[]>([]);
  statusFilter$ = this.statusFilterSubject.asObservable();

  // Combined Filters Logic
  getFilteredTasks(
    sourceAll$: Observable<TaskWithAssignee[]>,
    sourceMy$: Observable<TaskWithAssignee[]>
  ): Observable<TaskWithAssignee[]> {
    const source$ = this.filterMode$.pipe(
      switchMap((mode) => (mode === 'all' ? sourceAll$ : sourceMy$))
    );

    return combineLatest([
      source$,
      this.searchTerm$,
      this.priorityFilter$,
      this.assigneeFilter$,
      this.statusFilter$,
    ]).pipe(
      map(([tasks, term, selectedPriorities, selectedAssignees, selectedStatuses]) =>
        tasks.filter((task) => {
          // 1. Search Term
          const matchesTerm =
            !term ||
            task.title.toLowerCase().includes(term.toLowerCase()) ||
            task.description?.toLowerCase().includes(term.toLowerCase());

          // 2. Priority Filter (Multi-select)
          // Note: If filter is empty, it means "All"
          const matchesPriority =
            selectedPriorities.length === 0 ||
            (task.priority && selectedPriorities.includes(task.priority));

          // 3. Assignee Filter (Multi-select)
          const matchesAssignee =
            selectedAssignees.length === 0 ||
            (selectedAssignees.includes('unassigned') && !task.assigneeId) ||
            (task.assigneeId && selectedAssignees.includes(task.assigneeId));

          // 4. Status Filter (Multi-select)
          const matchesStatus =
            selectedStatuses.length === 0 || selectedStatuses.includes(task.status);

          return matchesTerm && matchesPriority && matchesAssignee && matchesStatus;
        })
      )
    );
  }

  // Toggle Filters UI
  toggleFilterMenu() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  setFilterCategory(category: 'assignee' | 'status' | 'priority') {
    this.activeFilterCategory = category;
  }

  // Helper to toggle item in array
  toggleSelection(subject: BehaviorSubject<string[]>, value: string) {
    const current = subject.getValue();
    if (current.includes(value)) {
      subject.next(current.filter((item) => item !== value));
    } else {
      subject.next([...current, value]);
    }
  }

  isSelected(subject: BehaviorSubject<string[]>, value: string): boolean {
    return subject.getValue().includes(value);
  }

  clearAllFilters() {
    this.priorityFilterSubject.next([]);
    this.statusFilterSubject.next([]);
    this.assigneeFilterSubject.next([]);
    this.searchTermSubject.next('');
  }

  countActiveFilters(): number {
    return (
      this.priorityFilterSubject.getValue().length +
      this.statusFilterSubject.getValue().length +
      this.assigneeFilterSubject.getValue().length
    );
  }

  todoTasks$: Observable<TaskWithAssignee[]> = this.getFilteredTasks(
    this.allTodoTasks$,
    this.myTodoTasks$
  );

  inProgressTasks$: Observable<TaskWithAssignee[]> = this.getFilteredTasks(
    this.allInProgressTasks$,
    this.myInProgressTasks$
  );

  doneTasks$: Observable<TaskWithAssignee[]> = this.getFilteredTasks(
    this.allDoneTasks$,
    this.myDoneTasks$
  );

  isModalOpen = false;
  editingTask: Task | null = null;

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
    this.store.dispatch(TaskActions.loadTasks());
  }

  //open Modal
  openModal(task: Task | null = null) {
    this.editingTask = task;
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
    this.editingTask = null;
  }

  //delete task

  onDeleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TaskActions.deleteTask({ taskId }));
    }
  }

  setFilter(mode: 'all' | 'my') {
    this.filterModeSubject.next(mode);
  }
  //onDrop

  onDrop(event: CdkDragDrop<TaskWithAssignee[]>) {
    if (event.previousContainer === event.container) return;
    const task = event.previousContainer.data[event.previousIndex];
    const newStatus = this.getColumnStatus(event.container.id);

    if (newStatus) {
      this.store.dispatch(TaskActions.updateTask({ task: { id: task.id, status: newStatus } }));
    }
  }

  private getColumnStatus(columnId: string): 'To Do' | 'In Progress' | 'Done' | null {
    switch (columnId) {
      case 'todo-list':
        return 'To Do';
      case 'inprogress-list':
        return 'In Progress';
      case 'done-list':
        return 'Done';
      default:
        return null;
    }
  }

  trackByTask(index: number, task: Task): string {
    return task.id;
  }
}
