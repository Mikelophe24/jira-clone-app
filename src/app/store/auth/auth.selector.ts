import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.model';
import { selectAllUsers } from '../user/user.selectors';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsLoggedIn = createSelector(selectAuthState, (state) => !!state.uid);

export const selectUser = createSelector(selectAuthState, (state) => ({
  uid: state.uid,
  email: state.email,
}));

export const selectCurrentUserId = createSelector(selectAuthState, (state) => state.uid);

// Get current user's full profile from users collection
export const selectCurrentUserProfile = createSelector(
  selectCurrentUserId,
  selectAllUsers,
  (currentUserId, users) => {
    if (!currentUserId || !users || users.length === 0) return null;
    return users.find((user) => user.uid === currentUserId) || null;
  }
);
