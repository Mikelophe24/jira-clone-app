import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { inject } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { from } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);

  private fireStore: Firestore = inject(Firestore);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: any, password: any) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    return from(signOut(this.auth));
  }

  createUserDocument(uid: string, email: string, name: string) {
    const userDocRef = doc(this.fireStore, `users/${uid}`);
    const userData = {
      uid: uid,
      email: email,
      name: name,
    };
    return from(setDoc(userDocRef, userData));
  }
}
