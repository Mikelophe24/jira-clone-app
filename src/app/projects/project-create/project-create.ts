import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProjectActions } from '../../store/project/project.actions';
import { selectCurrentUserId } from '../../store/auth/auth.selector';
import { first } from 'rxjs';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-create.html',
  styleUrl: './project-create.scss',
})
export class ProjectCreateComponent {
  private store = inject(Store);
  private router = inject(Router);

  projectData = {
    name: '',
    description: '',
  };

  onSubmit() {
    if (!this.projectData.name.trim()) {
      return;
    }

    this.store
      .select(selectCurrentUserId)
      .pipe(first())
      .subscribe((userId) => {
        if (userId) {
          this.store.dispatch(
            ProjectActions.createProject({
              projectData: {
                name: this.projectData.name.trim(),
                description: this.projectData.description.trim(),
                ownerId: userId,
                members: [userId], // Owner is automatically a member
              },
            })
          );
        }
      });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
}
