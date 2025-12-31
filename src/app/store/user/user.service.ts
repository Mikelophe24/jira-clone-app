import { inject, Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  getUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    return new Observable<User[]>((observer) => {
      return onSnapshot(
        usersCollection,
        (snapshot) => {
          const users = snapshot.docs.map((doc) => ({
            ...(doc.data() as User),
            uid: doc.id,
          }));
          console.log('Firebase emit new users:', users.length, users);
          observer.next(users);
        },
        (error) => {
          console.error('Error fetching users:', error);
          observer.error(error);
        }
      );
    });
  }
}
