import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  Firestore,
  onSnapshot,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Task } from './task.model';
import { Comment } from '../comments/comments.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private fireStore: Firestore = inject(Firestore);

  private getTasksCollection() {
    return collection(this.fireStore, 'tasks');
  }

  getTasks(): Observable<Task[]> {
    return new Observable<Task[]>((observer) => {
      return onSnapshot(
        this.getTasksCollection(),
        (snapshot) => {
          const tasks = snapshot.docs.map((doc) => ({
            ...(doc.data() as Task),
            id: doc.id,
          }));
          console.log('Firebase emit new tasks:', tasks.length);
          observer.next(tasks);
        },
        (error) => observer.error(error)
      );
    });
  }

  //add
  addTask(taskdata: Omit<Task, 'id'>): Observable<DocumentReference> {
    return from(addDoc(this.getTasksCollection(), taskdata));
  }

  //update
  updateTask(taskdata: Partial<Task>): Observable<void> {
    const taskDocRef = doc(this.fireStore, `tasks/${taskdata.id}`);
    return from(updateDoc(taskDocRef, taskdata));
  }

  //delete
  deleteTask(taskId: string): Observable<void> {
    const taskDocRef = doc(this.fireStore, `tasks/${taskId}`);
    return from(deleteDoc(taskDocRef));
  }

  //getcomments
  getComments(taskId: string): Observable<Comment[]> {
    const commentsCollection = collection(this.fireStore, `tasks/${taskId}/comments`);
    const q = query(commentsCollection, orderBy('createdAt', 'asc'));

    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (QuerySnapshot) => {
          const comments: Comment[] = [];
          QuerySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() } as Comment);
          });
          subscriber.next(comments);
        },
        (error) => {
          subscriber.error(error);
        }
      );
      return () => unsubscribe();
    });
    //return
  }

  //addcomments
  addComment(
    taskId: string,
    content: string,
    user: { uid: string; name: string; email: string }
  ): Observable<DocumentReference> {
    const commentsCollection = collection(this.fireStore, `tasks/${taskId}/comments`);
    return from(
      addDoc(commentsCollection, {
        taskId,
        content,
        authorId: user.uid,
        authorName: user.name,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      })
    );
  }
}
