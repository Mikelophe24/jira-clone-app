import { createReducer, on } from '@ngrx/store';
import { UserState } from './user.model';
import { UserActions } from './user.actions';

export const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
};

export const usersReducers = createReducer(
  initialState,

  on(UserActions.loadUsers, (state) => ({ ...state, isLoading: true })),
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    isLoading: false,
    users,
    error: null,
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }))
);
