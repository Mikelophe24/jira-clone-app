import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsLoggedIn = createSelector(selectAuthState, (state) => !!state.uid);

export const selectUser = createSelector(selectAuthState, (state) => ({
  uid: state.uid,
  email: state.email,
}));

export const selectCurrentUserId = createSelector(selectAuthState, (state) => state.uid);
