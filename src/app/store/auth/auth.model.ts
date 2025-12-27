export interface AuthState {
  uid: string | null;
  email: string | null;
  error: string | null;
  isLoading: boolean;
}
