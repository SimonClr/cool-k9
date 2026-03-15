import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useTheme } from '@authentication';

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeMobileMenu = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <img src="/logo.png" alt="Cool K9" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6">
              <Link
                to="/sessions"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/sessions')
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Sessions
              </Link>
              <Link
                to="/dogs"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/dogs')
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Chiens
              </Link>
              <Link
                to="/pricing"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/pricing')
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Tarifs
              </Link>
            </nav>
            <div className="flex items-center gap-2 border-l pl-6">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
                {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Se déconnecter">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-expanded={drawerOpen}
            aria-controls="mobile-menu"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Mobile Navigation Drawer */}
          {drawerOpen && (
            <>
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden"
                onClick={closeMobileMenu}
                aria-hidden="true"
              ></div>
              <nav id="mobile-menu" className="fixed top-0 right-0 bottom-0 w-64 bg-background border-l md:hidden flex flex-col" role="dialog" aria-modal="true" aria-label="Menu de navigation">
                <div className="flex items-center justify-between h-16 px-6 border-b shrink-0">
                  <img src="/logo.png" alt="Cool K9" className="h-12 w-auto" />
                  <Button variant="ghost" size="icon" onClick={closeMobileMenu} aria-label="Fermer le menu">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex flex-col gap-4 p-6 flex-1">
                <Link
                  to="/sessions"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/sessions')
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                  onClick={closeMobileMenu}
                >
                  Sessions
                </Link>
                <Link
                  to="/dogs"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dogs')
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                  onClick={closeMobileMenu}
                >
                  Chiens
                </Link>
                <Link
                  to="/pricing"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/pricing')
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                  onClick={closeMobileMenu}
                >
                  Tarifs
                </Link>
                <div className="mt-auto pt-4 border-t flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  <Button variant="ghost" className="justify-start gap-2 px-0" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                    {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  </Button>
                  <Button variant="ghost" className="justify-start gap-2 px-0" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Se déconnecter
                  </Button>
                </div>
                </div>
              </nav>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
