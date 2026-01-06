import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { from, map, Observable, switchMap } from 'rxjs';
import { Project } from './project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private firestore = inject(Firestore);
  private projectsCollection = collection(this.firestore, 'projects');

  /**
   * Get all projects where user is owner or member
   */
  getProjects(userId: string): Observable<Project[]> {
    // Query projects where user is owner
    const ownerQuery = query(this.projectsCollection, where('ownerId', '==', userId));

    // Query projects where user is a member
    const memberQuery = query(this.projectsCollection, where('members', 'array-contains', userId));

    // Combine both queries
    return from(Promise.all([getDocs(ownerQuery), getDocs(memberQuery)])).pipe(
      map(([ownerSnapshot, memberSnapshot]) => {
        const projectsMap = new Map<string, Project>();

        // Add owner projects
        ownerSnapshot.forEach((doc) => {
          const data = doc.data();
          projectsMap.set(doc.id, {
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
          } as Project);
        });

        // Add member projects (avoid duplicates)
        memberSnapshot.forEach((doc) => {
          if (!projectsMap.has(doc.id)) {
            const data = doc.data();
            projectsMap.set(doc.id, {
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate() || new Date(),
              updatedAt: data['updatedAt']?.toDate() || new Date(),
            } as Project);
          }
        });

        return Array.from(projectsMap.values());
      })
    );
  }

  /**
   * Get a single project by ID
   */
  getProjectById(projectId: string): Observable<Project | null> {
    const projectDoc = doc(this.firestore, `projects/${projectId}`);
    return from(getDoc(projectDoc)).pipe(
      map((snapshot) => {
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
        } as Project;
      })
    );
  }

  /**
   * Create a new project
   */
  createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    const now = new Date();
    const newProject = {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    };

    return from(addDoc(this.projectsCollection, newProject)).pipe(
      map((docRef) => ({
        id: docRef.id,
        ...newProject,
      }))
    );
  }

  /**
   * Update project
   */
  updateProject(projectId: string, updates: Partial<Project>): Observable<void> {
    const projectDoc = doc(this.firestore, `projects/${projectId}`);
    return from(
      updateDoc(projectDoc, {
        ...updates,
        updatedAt: new Date(),
      })
    );
  }

  /**
   * Delete project
   */
  deleteProject(projectId: string): Observable<void> {
    const projectDoc = doc(this.firestore, `projects/${projectId}`);
    return from(deleteDoc(projectDoc));
  }

  /**
   * Add member to project by email
   */
  addMemberByEmail(projectId: string, email: string): Observable<string> {
    // First, find user by email
    const usersCollection = collection(this.firestore, 'users');
    const userQuery = query(usersCollection, where('email', '==', email));

    return from(getDocs(userQuery)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          throw new Error('User not found with this email');
        }

        const userDoc = snapshot.docs[0];
        const userId = userDoc.id;

        // Get current project
        const projectDoc = doc(this.firestore, `projects/${projectId}`);
        return from(getDoc(projectDoc)).pipe(
          switchMap((projectSnapshot) => {
            if (!projectSnapshot.exists()) {
              throw new Error('Project not found');
            }

            const projectData = projectSnapshot.data();
            const currentMembers = projectData['members'] || [];

            // Check if user is already a member
            if (currentMembers.includes(userId)) {
              throw new Error('User is already a member of this project');
            }

            // Add user to members array
            return from(
              updateDoc(projectDoc, {
                members: [...currentMembers, userId],
                updatedAt: new Date(),
              })
            ).pipe(map(() => userId));
          })
        );
      })
    );
  }

  /**
   * Remove member from project
   */
  removeMember(projectId: string, userId: string): Observable<void> {
    const projectDoc = doc(this.firestore, `projects/${projectId}`);

    return from(getDoc(projectDoc)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.exists()) {
          throw new Error('Project not found');
        }

        const projectData = snapshot.data();
        const currentMembers = projectData['members'] || [];

        // Remove user from members array
        const updatedMembers = currentMembers.filter((id: string) => id !== userId);

        return from(
          updateDoc(projectDoc, {
            members: updatedMembers,
            updatedAt: new Date(),
          })
        );
      })
    );
  }
}
