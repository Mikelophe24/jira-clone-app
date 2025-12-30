import { Component, Input } from '@angular/core';
import { Task } from '../../store/task/task.model';
@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  @Input({ required: true }) task!: Task;
}
