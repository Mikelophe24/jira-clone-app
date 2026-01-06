import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { BehaviorSubject, combineLatest, filter, map, Observable, switchMap } from 'rxjs';
import { Task, TaskWithAssignee } from '../../store/task/task.model';
import { TaskActions } from '../../store/task/task.actions';
import { UserActions } from '../../store/user/user.actions';
import { ProjectActions } from '../../store/project/project.actions';
import { TaskCard } from '../task-card/task-card';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AddEditTaskComponent } from '../add-edit-task/add-edit-task';
import {
  selectDoneTasksByCurrentProject,
  selectInProgressTasksByCurrentProject,
  selectMyDoneTasksByCurrentProject,
  selectMyInProgressTasksByCurrentProject,
  selectMyTodoTasksByCurrentProject,
  selectTodoTasksByCurrentProject,
} from '../../store/task/task.selectors';
import { selectAllUsers } from '../../store/user/user.selectors';
import { selectCurrentProject } from '../../store/project/project.selectors';
import { User } from '../../store/user/user.model';
import { Project } from '../../store/project/project.model';
import { FormsModule } from '@angular/forms';
import { calculateNewOrder } from '../../utils/drag-drop.utils';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [TaskCard, DragDropModule, CommonModule, AddEditTaskComponent, FormsModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoard implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Get projectId from route
  projectId$ = this.route.params.pipe(map((params) => params['projectId']));

  // Get current project
  currentProject$: Observable<Project | null> = this.store.select(selectCurrentProject);

  users$: Observable<User[]> = this.store.select(selectAllUsers);

  // Filter tasks by current project
  allTodoTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectTodoTasksByCurrentProject
  );

  allInProgressTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectInProgressTasksByCurrentProject
  );

  allDoneTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectDoneTasksByCurrentProject
  );

  myTodoTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectMyTodoTasksByCurrentProject
  );

  myInProgressTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectMyInProgressTasksByCurrentProject
  );

  myDoneTasks$: Observable<TaskWithAssignee[]> = this.store.select(
    selectMyDoneTasksByCurrentProject
  );

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

    // Select current project from route
    this.projectId$.subscribe((projectId) => {
      if (projectId) {
        this.store.dispatch(ProjectActions.selectProject({ projectId }));
      }
    });
  }

  // Navigation methods
  goToProjects() {
    this.router.navigate(['/projects']);
  }

  goToProjectSettings() {
    this.projectId$.subscribe((projectId) => {
      if (projectId) {
        this.router.navigate(['/projects', projectId, 'settings']);
      }
    });
  }

  openModal(task: Task | null = null) {
    this.editingTask = task;
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
    this.editingTask = null;
  }

  onDeleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TaskActions.deleteTask({ taskId }));
    }
  }

  setFilter(mode: 'all' | 'my') {
    this.filterModeSubject.next(mode);
  }

  onDrop(event: CdkDragDrop<TaskWithAssignee[]>) {
    const task = event.previousContainer.data[event.previousIndex];
    const targetTasks = event.container.data;

    // Case 1: Reordering within the same column
    if (event.previousContainer === event.container) {
      const newOrder = calculateNewOrder(targetTasks, event.currentIndex, task.id);

      this.store.dispatch(
        TaskActions.updateTask({
          task: {
            id: task.id,
            order: newOrder,
          },
        })
      );
      return;
    }

    // Case 2: Moving to a different column
    const newStatus = this.getColumnStatus(event.container.id);
    if (newStatus) {
      const newOrder = calculateNewOrder(targetTasks, event.currentIndex);

      this.store.dispatch(
        TaskActions.updateTask({
          task: {
            id: task.id,
            status: newStatus,
            order: newOrder,
          },
        })
      );
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
