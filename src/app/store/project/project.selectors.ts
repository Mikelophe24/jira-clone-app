import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState, Project, ProjectWithOwner } from './project.model';
import { selectAllUsers } from '../user/user.selectors';
import { selectCurrentUserId } from '../auth/auth.selector';

export const selectProjectState = createFeatureSelector<ProjectState>('projects');

// Basic selectors
export const selectAllProjects = createSelector(selectProjectState, (state) => state.projects);

export const selectCurrentProjectId = createSelector(
  selectProjectState,
  (state) => state.currentProjectId
);

export const selectProjectsLoading = createSelector(selectProjectState, (state) => state.isLoading);

export const selectProjectsError = createSelector(selectProjectState, (state) => state.error);

// Get current project
export const selectCurrentProject = createSelector(
  selectAllProjects,
  selectCurrentProjectId,
  (projects, currentProjectId): Project | null => {
    if (!currentProjectId) return null;
    return projects.find((p) => p.id === currentProjectId) || null;
  }
);

// Get project by ID (factory selector)
export const selectProjectById = (projectId: string) =>
  createSelector(selectAllProjects, (projects): Project | null => {
    return projects.find((p) => p.id === projectId) || null;
  });

// Get projects owned by current user
export const selectMyProjects = createSelector(
  selectAllProjects,
  selectAllUsers,
  selectCurrentUserId,
  (projects, users, currentUserId): ProjectWithOwner[] => {
    if (!currentUserId) return [];

    const usersMap = new Map(users.map((user) => [user.uid, user.name]));

    return projects
      .filter((project) => project.ownerId === currentUserId)
      .map((project) => ({
        ...project,
        ownerName: usersMap.get(project.ownerId),
        memberCount: project.members.length,
      }));
  }
);

// Get projects shared with current user (not owned by them)
export const selectSharedProjects = createSelector(
  selectAllProjects,
  selectAllUsers,
  selectCurrentUserId,
  (projects, users, currentUserId): ProjectWithOwner[] => {
    if (!currentUserId) return [];

    const usersMap = new Map(users.map((user) => [user.uid, user.name]));

    return projects
      .filter(
        (project) => project.ownerId !== currentUserId && project.members.includes(currentUserId)
      )
      .map((project) => ({
        ...project,
        ownerName: usersMap.get(project.ownerId),
        memberCount: project.members.length,
      }));
  }
);

// Check if current user is owner of a project
export const selectIsProjectOwner = (projectId: string) =>
  createSelector(selectAllProjects, selectCurrentUserId, (projects, currentUserId): boolean => {
    if (!currentUserId) return false;
    const project = projects.find((p) => p.id === projectId);
    return project ? project.ownerId === currentUserId : false;
  });

// Get members of current project
export const selectCurrentProjectMembers = createSelector(
  selectCurrentProject,
  selectAllUsers,
  (project, users) => {
    if (!project) return [];
    return users.filter((user) => project.members.includes(user.uid));
  }
);

// Get members of a specific project
export const selectProjectMembers = (projectId: string) =>
  createSelector(selectAllProjects, selectAllUsers, (projects, users) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    return users.filter((user) => project.members.includes(user.uid));
  });
