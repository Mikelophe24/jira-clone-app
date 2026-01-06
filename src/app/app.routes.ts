import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },

  // Profile route
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/user-profile/user-profile').then((m) => m.UserProfileComponent),
    canActivate: [authGuard],
  },

  // Project routes
  {
    path: 'projects',
    loadComponent: () =>
      import('./projects/project-list/project-list').then((m) => m.ProjectListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/create',
    loadComponent: () =>
      import('./projects/project-create/project-create').then((m) => m.ProjectCreateComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:projectId/board',
    loadComponent: () => import('./kanban/kanban-board/kanban-board').then((m) => m.KanbanBoard),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:projectId/settings',
    loadComponent: () =>
      import('./projects/project-settings/project-settings').then(
        (m) => m.ProjectSettingsComponent
      ),
    canActivate: [authGuard],
  },

  // Legacy route (redirect to projects)
  {
    path: 'board',
    redirectTo: 'projects',
    pathMatch: 'full',
  },

  // Default routes
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
