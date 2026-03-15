import { useEffect, useState } from 'react';
import { Session } from '@models';
import { SessionService } from '../../services/session.service';
import { SessionCard } from './components/SessionCard';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

export function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await SessionService.getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Mes séances</h1>
        </header>
        <div aria-live="polite" aria-busy="true" className="flex items-center justify-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Mes séances</h1>
        </header>
        <div role="alert" className="flex items-center gap-2 text-destructive py-4">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Mes séances</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))}

        {sessions.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <Inbox className="h-12 w-12" aria-hidden="true" />
            <p>Aucune séance trouvée</p>
          </div>
        )}
      </section>
    </div>
  );
}
