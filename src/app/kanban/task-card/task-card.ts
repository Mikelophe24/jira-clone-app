import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task, TaskWithAssignee } from '../../store/task/task.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  @Input({ required: true }) task!: TaskWithAssignee;
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();

  isOverdue(dateStr: string): boolean {
    if (!dateStr || this.task.status === 'Done') return false;
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#dfe1e6';
    const colors = [
      '#0052cc',
      '#00875a',
      '#00b8d9',
      '#ffab00',
      '#ff5630',
      '#6554c0',
      '#42526e',
      '#ff7452',
      '#36b37e',
      '#2684ff',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
