export { supabase } from './lib/supabase.client';
export { AuthProvider, useAuth } from './lib/AuthContext';
export { ProtectedRoute, AdminRoute } from './lib/ProtectedRoute';
export { ThemeProvider, useTheme } from './lib/ThemeContext';
export type { AuthUser, AuthState } from './lib/types';
