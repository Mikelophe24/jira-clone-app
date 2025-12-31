import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task, TaskWithAssignee } from '../../store/task/task.model';
@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  @Input({ required: true }) task!: TaskWithAssignee;
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();
}
