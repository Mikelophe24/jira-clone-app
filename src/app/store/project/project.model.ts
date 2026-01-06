export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string; // UID of the user who created the project
  members: string[]; // Array of user UIDs who have access
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProjectWithOwner extends Project {
  ownerName?: string;
  memberCount: number;
}
