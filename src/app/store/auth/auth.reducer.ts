import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.model';
import { AuthActions } from './auth.action';

export const initialState: AuthState = {
  uid: null,
  email: null,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { uid, email }) => ({
    ...state,
    isLoading: false,
    uid,
    email,
    error: null,
  })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(AuthActions.logoutSuccess, () => initialState)
);
