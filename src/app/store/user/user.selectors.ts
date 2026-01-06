import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.model';

export const selectUsersState = createFeatureSelector<UserState>('user');

export const selectAllUsers = createSelector(selectUsersState, (state) => state?.users || []);
