import { createReducer, on } from '@ngrx/store';
import { ProjectActions } from './project.actions';
import { ProjectState } from './project.model';

export const initialState: ProjectState = {
  projects: [],
  currentProjectId: null,
  isLoading: false,
  error: null,
};

export const projectReducer = createReducer(
  initialState,

  // Load Projects
  on(ProjectActions.loadProjects, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProjectActions.loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    isLoading: false,
    error: null,
  })),
  on(ProjectActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create Project
  on(ProjectActions.createProject, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProjectActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
    isLoading: false,
    error: null,
  })),
  on(ProjectActions.createProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Select Project
  on(ProjectActions.selectProject, (state, { projectId }) => ({
    ...state,
    currentProjectId: projectId,
  })),

  // Update Project
  on(ProjectActions.updateProject, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProjectActions.updateProjectSuccess, (state, { project }) => ({
    ...state,
    projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    isLoading: false,
    error: null,
  })),
  on(ProjectActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Delete Project
  on(ProjectActions.deleteProject, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProjectActions.deleteProjectSuccess, (state, { projectId }) => ({
    ...state,
    projects: state.projects.filter((p) => p.id !== projectId),
    currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,
    isLoading: false,
    error: null,
  })),
  on(ProjectActions.deleteProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Add Member
  on(ProjectActions.addMember, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProjectActions.addMemberSuccess, (state, { projectId, userId }) => ({
    ...state,
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, members: [...p.members, userId] } : p
    ),
    isLoading: false,
    error: null,
  })),
  on(ProjectActions.addMemberFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Remove Member
  on(ProjectActions.removeMember, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProjectActions.removeMemberSuccess, (state, { projectId, userId }) => ({
    ...state,
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, members: p.members.filter((id) => id !== userId) } : p
    ),
    isLoading: false,
    error: null,
  })),
  on(ProjectActions.removeMemberFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }))
);
