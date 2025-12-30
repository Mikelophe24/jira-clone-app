import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectDoneTasks,
  selectInProgressTasks,
  selectTodoTasks,
} from '../../store/task/task.selectors';
import { Observable } from 'rxjs';
import { Task } from '../../store/task/task.model';
import { TaskActions } from '../../store/task/task.actions';
import { TaskCard } from '../task-card/task-card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-kanban-board',
  imports: [TaskCard, DragDropModule, CommonModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit {
  private store = inject(Store);

  todoTasks$: Observable<Task[]> = this.store.select(selectTodoTasks);
  inProgressTasks$: Observable<Task[]> = this.store.select(selectInProgressTasks);
  doneTasks$: Observable<Task[]> = this.store.select(selectDoneTasks);

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }
}
