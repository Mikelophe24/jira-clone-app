import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Project } from './project.model';

export const ProjectActions = createActionGroup({
  source: 'Project',
  events: {
    // Load Projects
    'Load Projects': emptyProps(),
    'Load Projects Success': props<{ projects: Project[] }>(),
    'Load Projects Failure': props<{ error: string }>(),

    // Create Project
    'Create Project': props<{
      projectData: {
        name: string;
        description: string;
        ownerId: string;
        members: string[];
      };
    }>(),
    'Create Project Success': props<{ project: Project }>(),
    'Create Project Failure': props<{ error: string }>(),

    // Select Project
    'Select Project': props<{ projectId: string }>(),

    // Update Project
    'Update Project': props<{
      projectId: string;
      updates: Partial<Project>;
    }>(),
    'Update Project Success': props<{ project: Project }>(),
    'Update Project Failure': props<{ error: string }>(),

    // Delete Project
    'Delete Project': props<{ projectId: string }>(),
    'Delete Project Success': props<{ projectId: string }>(),
    'Delete Project Failure': props<{ error: string }>(),

    // Add Member
    'Add Member': props<{ projectId: string; email: string }>(),
    'Add Member Success': props<{ projectId: string; userId: string }>(),
    'Add Member Failure': props<{ error: string }>(),

    // Remove Member
    'Remove Member': props<{ projectId: string; userId: string }>(),
    'Remove Member Success': props<{ projectId: string; userId: string }>(),
    'Remove Member Failure': props<{ error: string }>(),
  },
});
