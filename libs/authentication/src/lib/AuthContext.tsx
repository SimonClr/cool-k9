import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from './supabase.client';
import type { AuthState, AuthUser } from './types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user: AuthUser | null = session?.user
        ? { id: session.user.id, email: session.user.email ?? '' }
        : null;
      setState({ user, isAuthenticated: !!user, isLoading: false, error: null });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user: AuthUser | null = session?.user
        ? { id: session.user.id, email: session.user.email ?? '' }
        : null;
      setState({ user, isAuthenticated: !!user, isLoading: false, error: null });
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Email ou mot de passe incorrect',
      }));
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const register = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({ email, password });
    setState((prev) => ({ ...prev, isLoading: false }));

    if (data.user?.identities?.length === 0) {
      const msg = 'Un compte existe déjà avec cette adresse email';
      setState((prev) => ({ ...prev, error: msg }));
      throw new Error(msg);
    }

    if (error) {
      let msg = 'Erreur lors de la création du compte';
      if (error.code === 'weak_password') {
        msg = 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères avec des minuscules, majuscules, chiffres et caractères spéciaux.';
      } else if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        msg = 'Un compte existe déjà avec cette adresse email';
      }
      setState((prev) => ({ ...prev, error: msg }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
