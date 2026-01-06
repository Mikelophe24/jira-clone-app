import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../store/user/user.model';
import { selectCurrentUserProfile } from '../../store/auth/auth.selector';
import { UserActions } from '../../store/user/user.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfileComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  currentUser$: Observable<User | null> = this.store.select(selectCurrentUserProfile);

  isEditing = false;
  editedName = '';

  ngOnInit(): void {
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.editedName = user.name;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    if (this.editedName.trim()) {
      this.store.dispatch(
        UserActions.updateUser({
          updates: { name: this.editedName.trim() },
        })
      );
      this.isEditing = false;
    }
  }

  cancelEdit() {
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.editedName = user.name;
      }
    });
    this.isEditing = false;
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}
