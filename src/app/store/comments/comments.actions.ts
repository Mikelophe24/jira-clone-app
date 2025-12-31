import { createActionGroup, props } from '@ngrx/store';
import { Comment } from './comments.model';

export const CommentsActions = createActionGroup({
  source: 'Comments',
  events: {
    'Load Comments': props<{ taskId: string }>(),
    'Load Comments Success': props<{ comments: Comment[] }>(),
    'Load Comments Failure': props<{ error: string }>(),

    'Add Comment': props<{ taskId: string; content: string }>(),
    'Add Comment Failure': props<{ error: string }>(),
  },
});
