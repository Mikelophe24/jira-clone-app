export interface User {
  uid: string;
  email: string;
  name: string;
}

export interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}
