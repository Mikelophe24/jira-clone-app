import { inject, Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, DocumentReference, updateDoc } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { Task } from './task.model';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private fireStore: Firestore = inject(Firestore);
  private tasksCollection = collection(this.fireStore, 'tasks');
  getTasks(): Observable<Task[]> {
    return collectionData(this.tasksCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  //add
  addTask(taskdata: Omit<Task, 'id'>): Observable<DocumentReference> {
    return from(addDoc(this.tasksCollection, taskdata));
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
}
