import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentsState, CommentWithAuthName } from './comments.model';
import { selectAllUsers } from '../user/user.selectors';

export const selectCommentsState = createFeatureSelector<CommentsState>('comments');

export const selectAllComments = createSelector(selectCommentsState, (state) => state.comments);

export const selectCommentsWithAuthorDetails = createSelector(
  selectAllComments,
  selectAllUsers,
  (comments, users): CommentWithAuthName[] => {
    const userMap = new Map(users.map((user) => [user.uid, user.name]));
    return comments.map((comment) => ({
      ...comment,
      authorname: userMap.get(comment.authorId),
    }));
  }
);
