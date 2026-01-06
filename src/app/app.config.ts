import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ActionReducer, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { localStorageSync } from 'ngrx-store-localstorage';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { AuthEffects } from './store/auth/auth.effects';
import { authReducer } from './store/auth/auth.reducer';
import { taskReducer } from './store/task/task.reducer';
import { TaskEffects } from './store/task/task.effects';
import { usersReducers } from './store/user/user.reducer';
import { UsersEffects } from './store/user/user.effects';
import { commentsReducer } from './store/comments/comments.reducer';
import { CommentsEffects } from './store/comments/comments.effects';
import { projectReducer } from './store/project/project.reducer';
import { ProjectEffects } from './store/project/project.effects';

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: ['auth'],
    rehydrate: true,
  })(reducer);
}

const metaReducers = [localStorageSyncReducer];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideStore(
      {
        router: routerReducer,
        auth: authReducer,
        tasks: taskReducer,
        user: usersReducers,
        comments: commentsReducer,
        projects: projectReducer,
      },
      { metaReducers }
    ),
    provideEffects([AuthEffects, TaskEffects, UsersEffects, CommentsEffects, ProjectEffects]),
    provideStoreDevtools({}),
    provideRouterStore(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
