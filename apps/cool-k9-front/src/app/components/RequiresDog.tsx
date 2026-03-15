import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DogService } from '../services/dog.service';
import { Loader2 } from 'lucide-react';

type Status = 'loading' | 'has-dogs' | 'no-dogs';

export function RequiresDog({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    DogService.getDogs()
      .then(dogs => setStatus(dogs.length > 0 ? 'has-dogs' : 'no-dogs'))
      .catch(() => setStatus('has-dogs')); // fail open : ne pas bloquer en cas d'erreur API
  }, []);

  if (status === 'loading') {
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

  if (status === 'no-dogs') {
    return <Navigate to="/dogs/new" replace />;
  }

  return <>{children}</>;
}
