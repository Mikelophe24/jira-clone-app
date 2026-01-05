import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login Success': props<{ uid: string; email: string }>(),
    'Login Failure': props<{ error: string }>(),

    Register: props<{ email: string; password: string; name: string }>(),
    'Register Success': props<{ uid: string; email: string }>(),
    'Register Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),
  },
});
