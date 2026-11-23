export interface AuthSessionUser {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface AuthResponse {
  user: AuthSessionUser | null;
  error?: string | null;
}
