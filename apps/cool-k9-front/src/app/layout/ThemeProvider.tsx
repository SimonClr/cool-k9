import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/app/features/auth';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const savedTheme = session?.user?.user_metadata?.['theme'] as Theme | undefined;
      const initial = savedTheme ?? 'light';
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const savedTheme = session?.user?.user_metadata?.['theme'] as Theme | undefined;
      const next = savedTheme ?? 'light';
      setTheme(next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    await supabase.auth.updateUser({ data: { theme: next } });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
