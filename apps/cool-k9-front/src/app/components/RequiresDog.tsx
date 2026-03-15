import { Navigate } from 'react-router-dom';
import { useDogs } from '../hooks/useDogs';
import { Loader2 } from 'lucide-react';

export function RequiresDog({ children }: { children: React.ReactNode }) {
  const { data: dogs, isLoading } = useDogs();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (!dogs || dogs.length === 0) {
    return <Navigate to="/dogs/new" replace />;
  }

  return <>{children}</>;
}
