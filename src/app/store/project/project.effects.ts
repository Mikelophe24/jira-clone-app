import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { ProjectActions } from './project.actions';
import { ProjectService } from './project.service';
import { selectCurrentUserId } from '../auth/auth.selector';
import { Router } from '@angular/router';

@Injectable()
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);
  private store = inject(Store);
  private router = inject(Router);

  // Load Projects
  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProjects),
      withLatestFrom(this.store.select(selectCurrentUserId)),
      switchMap(([, userId]) => {
        if (!userId) {
          return of(ProjectActions.loadProjectsFailure({ error: 'User not authenticated' }));
        }

        return this.projectService.getProjects(userId).pipe(
          map((projects) => ProjectActions.loadProjectsSuccess({ projects })),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error.message || 'Failed to load projects',
              })
            )
          )
        );
      })
    )
  );

  // Create Project
  createProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.createProject),
      mergeMap(({ projectData }) =>
        this.projectService.createProject(projectData).pipe(
          map((project) => ProjectActions.createProjectSuccess({ project })),
          catchError((error) =>
            of(
              ProjectActions.createProjectFailure({
                error: error.message || 'Failed to create project',
              })
            )
          )
        )
      )
    )
  );

  // Navigate to project board after creation
  createProjectSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProjectActions.createProjectSuccess),
        tap(({ project }) => {
          this.router.navigate(['/projects', project.id, 'board']);
        })
      ),
    { dispatch: false }
  );

  // Update Project
  updateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.updateProject),
      mergeMap(({ projectId, updates }) =>
        this.projectService.updateProject(projectId, updates).pipe(
          map(() =>
            ProjectActions.updateProjectSuccess({ project: { id: projectId, ...updates } as any })
          ),
          catchError((error) =>
            of(
              ProjectActions.updateProjectFailure({
                error: error.message || 'Failed to update project',
              })
            )
          )
        )
      )
    )
  );

  // Delete Project
  deleteProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.deleteProject),
      mergeMap(({ projectId }) =>
        this.projectService.deleteProject(projectId).pipe(
          map(() => ProjectActions.deleteProjectSuccess({ projectId })),
          catchError((error) =>
            of(
              ProjectActions.deleteProjectFailure({
                error: error.message || 'Failed to delete project',
              })
            )
          )
        )
      )
    )
  );

  // Add Member
  addMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.addMember),
      mergeMap(({ projectId, email }) =>
        this.projectService.addMemberByEmail(projectId, email).pipe(
          map((userId) => ProjectActions.addMemberSuccess({ projectId, userId })),
          catchError((error) =>
            of(ProjectActions.addMemberFailure({ error: error.message || 'Failed to add member' }))
          )
        )
      )
    )
  );

  // Remove Member
  removeMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.removeMember),
      mergeMap(({ projectId, userId }) =>
        this.projectService.removeMember(projectId, userId).pipe(
          map(() => ProjectActions.removeMemberSuccess({ projectId, userId })),
          catchError((error) =>
            of(
              ProjectActions.removeMemberFailure({
                error: error.message || 'Failed to remove member',
              })
            )
          )
        )
      )
    )
  );
}
