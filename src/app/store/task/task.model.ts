export interface Task {
  id: string;
  projectId?: string; // Link to project (optional for backward compatibility)
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  reporterId: string;
  assigneeId?: string;
  priority?: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  taskNumber?: number;
  order?: number; // For ordering tasks within a column (fractional indexing)
}

export interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

//
export interface TaskWithAssignee extends Task {
  assigneeName?: string;
  reporterName?: string;
}
