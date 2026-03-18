import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSessions } from '../../hooks/useSessions';
import { useDogs } from '../../hooks/useDogs';
import { SessionCard } from './components/SessionCard';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { AlertCircle, Inbox, Loader2, PlusCircle } from 'lucide-react';

export function SessionsList() {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading, isError } = useSessions();
  const { data: dogs = [] } = useDogs();

  const handleNewSession = () => {
    if (dogs.length === 0) {
      toast.error('Créez d\'abord un chien avant de créer une séance (Mon profil > Mes chiens > Ajouter)');
      return;
    }
    navigate('/sessions/new');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes séances</h1>
        {sessions.length > 0 && (
          <Button onClick={handleNewSession}>
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Nouvelle séance
          </Button>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <EmptyContent>
                <Button onClick={handleNewSession}>
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  Nouvelle séance
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </section>
    </div>
  );
}
