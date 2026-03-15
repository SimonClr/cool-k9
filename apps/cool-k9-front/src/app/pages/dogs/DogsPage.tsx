import { Link } from 'react-router-dom';
import { useDogs } from '../../hooks/useDogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Inbox, Loader2, PlusCircle } from 'lucide-react';

export function DogsPage() {
  const { data: dogs = [], isLoading, isError } = useDogs();

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

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive gap-2">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
        <p>Erreur lors du chargement des chiens</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes chiens</h1>
        <Button asChild>
          <Link to="/dogs/new">
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Ajouter un chien
          </Link>
        </Button>
      </header>

      {dogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Inbox className="h-12 w-12" aria-hidden="true" />
          <p>Aucun chien enregistré</p>
        </div>
      ) : (
        <section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Liste des chiens"
        >
          {dogs.map(dog => (
            <Card key={dog.id} className="transition-transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle>{dog.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {dog.age} an{dog.age > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
