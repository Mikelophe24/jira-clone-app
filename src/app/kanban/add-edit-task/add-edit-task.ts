import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

import { Store } from '@ngrx/store';
import { filter, first, Observable } from 'rxjs';
import { User } from '../../store/user/user.model';
import { selectAllUsers } from '../../store/user/user.selectors';
import { UserActions } from '../../store/user/user.actions';
import { Task } from '../../store/task/task.model';
import { TaskActions } from '../../store/task/task.actions';
import { selectCurrentUserId } from '../../store/auth/auth.selector';

@Component({
  selector: 'app-add-edit-task',
  imports: [],
  templateUrl: './add-edit-task.html',
  styleUrl: './add-edit-task.scss',
})
export class AddEditTask implements OnInit {
  private store = inject(Store);
  @Input() task?: Task | null;
  //add

  //edit
  @Output() addTask = new EventEmitter<Task>();
  @Output() close = new EventEmitter<void>();

  //form

  taskData: {
    title: string;
    description: string;
    status: 'To do' | 'In progress' | 'Done';
    assignedId: string | null;
  } = {
    title: '',
    description: '',
    status: 'To do',
    assignedId: null,
  };

  idEditMode = false;

  users$: Observable<User[]> = this.store.select(selectAllUsers);

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
    if (this.task) {
      this.idEditMode = true;
      this.taskData = {
        title: this.task.title,
        description: this.task.description,
        status: this.task.status,
        assignedId: this.task.assignedId ?? null,
      };
    } else {
      this.idEditMode = false;
    }
  }

  onSubmit() {
    const payload = {
      title: this.taskData.title,
      description: this.taskData.description,
      status: this.taskData.status,
      assignedId: this.taskData.assignedId === null ? undefined : this.taskData.assignedId,
    };
    if (this.idEditMode && this.task) {
      this.store.dispatch(TaskActions.updateTask({ task: { id: this.task.id, ...payload } }));
    } else {
      //for new
      this.store
        .select(selectCurrentUserId)
        .pipe(
          filter((uid) => !!uid),
          first()
        )
        .subscribe((reportedId) => {
          this.store.dispatch(
            TaskActions.addTask({ taskData: { ...payload, reportedId: reportedId! } })
          );
        });
    }
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }
}
