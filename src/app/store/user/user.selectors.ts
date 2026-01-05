import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.model';
import { selectCurrentUserId } from '../auth/auth.selector';

export const selectUsersState = createFeatureSelector<UserState>('user');

export const selectAllUsers = createSelector(selectUsersState, (state) => state.users);

export const selectCurrentUserProfile = createSelector(
  selectAllUsers,
  selectCurrentUserId,
  (users, currentUserId) => users.find((user) => user.uid === currentUserId)
);
