import { Link } from 'react-router-dom';
import { PlusCircle, Loader2, Dog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@authentication';
import { useDogs } from '../../hooks/useDogs';

export function ProfilePage() {
  const { user } = useAuth();
  const { data: dogs, isLoading } = useDogs();

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      {/* User info */}
      <Card>
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      {/* Dogs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mes chiens</CardTitle>
          <Button asChild size="sm">
            <Link to="/dogs/new">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Ajouter
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : !dogs || dogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun chien enregistré</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {dogs.map(dog => (
                <li key={dog.id} className="flex items-center gap-3 py-3">
                  <Dog className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{dog.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{dog.age} ans</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
