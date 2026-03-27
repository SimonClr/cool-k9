import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../../hooks/useSessions';
import { SessionCard } from './components/SessionCard';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, Loader2, PlusCircle } from 'lucide-react';
import { useAuth } from '@authentication';

export function SessionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSessions(undefined, page);

  const sessions = data?.sessions ?? [];
  const totalPages = data ? Math.ceil(data.total / data.perPage) : 1;

  const handleNewSession = () => navigate('/sessions/new');

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mes séances</h1>
        </header>
        <div aria-live="polite" aria-busy="true" className="flex items-center justify-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mes séances</h1>
        </header>
        <div role="alert" className="flex items-center gap-2 text-destructive py-4">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <p>Erreur lors du chargement des séances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes séances</h1>
        {user?.isAdmin && sessions.length > 0 && (
          <Button onClick={handleNewSession}>
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Nouvelle séance
          </Button>
        )}
      </header>

      <section className="flex flex-col gap-4">
        {sessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))}

        {sessions.length === 0 && (
          <div className="col-span-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <Inbox className="h-12 w-12" aria-hidden="true" />
                </EmptyMedia>
                <EmptyDescription>Aucune séance trouvée</EmptyDescription>
              </EmptyHeader>
              {user?.isAdmin && (
                <EmptyContent>
                  <Button onClick={handleNewSession}>
                    <PlusCircle className="h-4 w-4" aria-hidden="true" />
                    Nouvelle séance
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
