import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
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

  updateUser(userId: string, updates: Partial<User>): Observable<void> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    return from(updateDoc(userDoc, updates));
  }
}
