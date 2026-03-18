export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
