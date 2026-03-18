import { useState } from 'react';
import { Loader2, Dog, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { useAuth } from '@authentication';
import { useDogs } from '../../hooks/useDogs';
import { AddDogModal } from '../../components/AddDogModal';

export function ProfilePage() {
  const { user } = useAuth();
  const { data: dogs, isLoading } = useDogs();
  const [addDogOpen, setAddDogOpen] = useState(false);

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
          <Button size="sm" onClick={() => setAddDogOpen(true)}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : !dogs || dogs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <Dog className="h-12 w-12" aria-hidden="true" />
                </EmptyMedia>
                <EmptyDescription>Aucun chien enregistré</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setAddDogOpen(true)}>
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  Ajouter un chien
                </Button>
              </EmptyContent>
            </Empty>
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

      <AddDogModal open={addDogOpen} onOpenChange={setAddDogOpen} />
    </div>
  );
}
