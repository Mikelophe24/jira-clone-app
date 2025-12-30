export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To do' | 'In progress' | 'Done';
  reportedId: string;
  assignedId?: string;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}
