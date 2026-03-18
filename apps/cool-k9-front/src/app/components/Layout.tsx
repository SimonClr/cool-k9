import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Menu, X, Sun, Moon, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useTheme } from '@authentication';

import { AddDogModal } from './AddDogModal';
import { useDogs } from '../hooks/useDogs';

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addDogOpen, setAddDogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { data: dogs, isLoading: dogsLoading } = useDogs();

  // Auto-open modal on first login (no dogs yet)
  useEffect(() => {
    if (!dogsLoading && dogs && dogs.length === 0 && !user?.isAdmin) {
      setAddDogOpen(true);
    }
  }, [dogsLoading, dogs]);

  const toggleMobileMenu = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeMobileMenu = () => {
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    queryClient.clear();
    closeMobileMenu();
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
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Mes séances
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/pricing"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/pricing')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  Tarifs
                </Link>
              )}
            </nav>
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-2 border-l pl-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
                      {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Mon profil" onClick={() => navigate('/profile')}>
                      <UserCircle className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mon profil</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Se déconnecter" className="text-destructive hover:text-destructive">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Se déconnecter</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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
                    Mes séances
                  </Link>
                  {user?.isAdmin && (
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
                  )}
                  <div className="mt-auto pt-4 border-t flex flex-col gap-3">
                    <Button variant="ghost" className="justify-start gap-2 px-2" onClick={toggleTheme}>
                      {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                      {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
                      <Link to="/profile" onClick={closeMobileMenu}>
                        <UserCircle className="h-4 w-4" aria-hidden="true" />
                        Mon profil
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-2 text-destructive hover:text-destructive" onClick={handleLogout}>
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

      <AddDogModal open={addDogOpen} onOpenChange={setAddDogOpen} />
    </div>
  );
}
