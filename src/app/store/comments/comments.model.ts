import { Timestamp } from '@angular/fire/firestore';

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorEmail: string;
  content: string;
  createdAt: Timestamp;
}

export interface CommentWithAuthName extends Comment {
  authorname?: string;
}

export interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}
