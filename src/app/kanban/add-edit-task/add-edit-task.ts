import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

import { Store } from '@ngrx/store';
import { filter, first, Observable, of } from 'rxjs';
import { User } from '../../store/user/user.model';
import { selectAllUsers } from '../../store/user/user.selectors';
import { UserActions } from '../../store/user/user.actions';
import { Task, TaskWithAssignee } from '../../store/task/task.model';
import { TaskActions } from '../../store/task/task.actions';
import { selectCurrentUserId } from '../../store/auth/auth.selector';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommentWithAuthName } from '../../store/comments/comments.model';
import { selectCommentsWithAuthorDetails } from '../../store/comments/comments.selectors';
import { CommentsActions } from '../../store/comments/comments.actions';

@Component({
  selector: 'app-add-edit-task',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-edit-task.html',
  styleUrl: './add-edit-task.scss',
})
export class AddEditTaskComponent implements OnInit {
  private store = inject(Store);

  @Input() task?: TaskWithAssignee | null;
  @Output() close = new EventEmitter<void>();

  taskData: {
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    assigneeId: string | null;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
  } = {
    title: '',
    description: '',
    status: 'To Do',
    assigneeId: null,
    priority: 'Medium',
    dueDate: '',
  };

  isEditMode = false;

  users$: Observable<User[]> = this.store.select(selectAllUsers);

  comments$: Observable<CommentWithAuthName[]> = this.store.select(selectCommentsWithAuthorDetails);
  newComment = '';

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());

    if (this.task) {
      this.isEditMode = true;
      this.taskData = {
        title: this.task.title,
        description: this.task.description,
        status: this.task.status,
        assigneeId: this.task.assigneeId || null,
        priority: this.task.priority || 'Medium',
        dueDate: this.task.dueDate || '',
      };
      this.store.dispatch(CommentsActions.loadComments({ taskId: this.task.id }));
    } else {
      this.isEditMode = false;
    }
  }

  onSubmit() {
    const payload = {
      title: this.taskData.title,
      description: this.taskData.description,
      status: this.taskData.status,
      priority: this.taskData.priority,
      dueDate: this.taskData.dueDate,
      assigneeId: this.taskData.assigneeId === null ? undefined : this.taskData.assigneeId,
    };

    if (this.isEditMode && this.task) {
      this.store.dispatch(
        TaskActions.updateTask({
          task: { id: this.task.id, ...payload },
        })
      );
    } else {
      //for new
      this.store
        .select(selectCurrentUserId)
        .pipe(
          filter((uid) => !!uid),
          first()
        )
        .subscribe((reporterId) => {
          this.store.dispatch(
            TaskActions.addTask({
              taskData: { ...payload, reporterId: reporterId! },
            })
          );
        });
    }

    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  onAddComment() {
    if (!this.newComment.trim() || !this.task) return;
    this.store.dispatch(
      CommentsActions.addComment({ taskId: this.task?.id, content: this.newComment })
    );
    this.newComment = '';
  }
}
