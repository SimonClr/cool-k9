import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeMobileMenu = () => {
    setDrawerOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-2xl">🐕</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>

          {/* Mobile Navigation Drawer */}
          {drawerOpen && (
            <>
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden"
                onClick={closeMobileMenu}
              ></div>
              <nav className="fixed top-16 right-0 bottom-0 w-64 bg-background border-l p-6 md:hidden flex flex-col gap-4">
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
              </nav>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}