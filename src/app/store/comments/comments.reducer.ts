import { createReducer, on } from '@ngrx/store';
import { CommentsState } from './comments.model';
import { CommentsActions } from './comments.actions';

export const initialState: CommentsState = {
  comments: [],
  isLoading: false,
  error: null,
};

export const commentsReducer = createReducer(
  initialState,
  on(CommentsActions.loadComments, (state) => ({ ...state, isLoading: true, comments: [] })),
  on(CommentsActions.loadCommentsSuccess, (state, { comments }) => ({
    ...state,
    isLoading: false,
    comments,
  })),
  on(
    CommentsActions.loadCommentsFailure,
    CommentsActions.addCommentFailure,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })
  )
);
