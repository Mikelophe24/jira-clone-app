import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, Observable, switchMap } from 'rxjs';
import { Project } from '../../store/project/project.model';
import { User } from '../../store/user/user.model';
import { ProjectActions } from '../../store/project/project.actions';
import {
  selectProjectById,
  selectIsProjectOwner,
  selectCurrentProjectMembers,
} from '../../store/project/project.selectors';
import { selectAllUsers } from '../../store/user/user.selectors';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-settings.html',
  styleUrl: './project-settings.scss',
})
export class ProjectSettingsComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  projectId$ = this.route.params.pipe(map((params) => params['projectId']));

  project$: Observable<Project | null> = this.projectId$.pipe(
    switchMap((projectId) => this.store.select(selectProjectById(projectId)))
  );

  isOwner$: Observable<boolean> = this.projectId$.pipe(
    switchMap((projectId) => this.store.select(selectIsProjectOwner(projectId)))
  );

  members$: Observable<User[]> = this.store.select(selectCurrentProjectMembers);
  allUsers$: Observable<User[]> = this.store.select(selectAllUsers);

  newMemberEmail = '';
  errorMessage = '';

  ngOnInit(): void {
    // Select current project
    this.projectId$.subscribe((projectId) => {
      this.store.dispatch(ProjectActions.selectProject({ projectId }));
    });
  }

  addMember() {
    if (!this.newMemberEmail.trim()) {
      return;
    }

    this.projectId$.pipe(filter((id) => !!id)).subscribe((projectId) => {
      this.store.dispatch(
        ProjectActions.addMember({
          projectId,
          email: this.newMemberEmail.trim(),
        })
      );
      this.newMemberEmail = '';
      this.errorMessage = '';
    });
  }

  removeMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    this.projectId$.pipe(filter((id) => !!id)).subscribe((projectId) => {
      this.store.dispatch(
        ProjectActions.removeMember({
          projectId,
          userId,
        })
      );
    });
  }

  deleteProject() {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    this.projectId$.pipe(filter((id) => !!id)).subscribe((projectId) => {
      this.store.dispatch(ProjectActions.deleteProject({ projectId }));
      this.router.navigate(['/projects']);
    });
  }

  goToBoard() {
    this.projectId$.pipe(filter((id) => !!id)).subscribe((projectId) => {
      this.router.navigate(['/projects', projectId, 'board']);
    });
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}
