import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProjectWithOwner } from '../../store/project/project.model';
import { ProjectActions } from '../../store/project/project.actions';
import {
  selectMyProjects,
  selectSharedProjects,
  selectProjectsLoading,
} from '../../store/project/project.selectors';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  myProjects$: Observable<ProjectWithOwner[]> = this.store.select(selectMyProjects);
  sharedProjects$: Observable<ProjectWithOwner[]> = this.store.select(selectSharedProjects);
  isLoading$: Observable<boolean> = this.store.select(selectProjectsLoading);

  ngOnInit(): void {
    this.store.dispatch(ProjectActions.loadProjects());
  }

  createProject() {
    this.router.navigate(['/projects/create']);
  }

  openProject(projectId: string) {
    this.store.dispatch(ProjectActions.selectProject({ projectId }));
    this.router.navigate(['/projects', projectId, 'board']);
  }

  openProjectSettings(projectId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/projects', projectId, 'settings']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
