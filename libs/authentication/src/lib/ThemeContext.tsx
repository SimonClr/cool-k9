import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase.client';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const saved = session?.user?.user_metadata?.['theme'] as Theme | undefined;
      const resolved = saved ?? 'light';
      setTheme(resolved);
      applyTheme(resolved);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const saved = session?.user?.user_metadata?.['theme'] as Theme | undefined;
      const resolved = saved ?? 'light';
      setTheme(resolved);
      applyTheme(resolved);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
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
