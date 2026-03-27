import { useState } from 'react';
import { Loader2, Dog, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { useAuth } from '@authentication';
import { toast } from 'sonner';
import { useDogs } from '../../hooks/useDogs';
import { AddDogModal } from '../../components/AddDogModal';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { data: dogs, isLoading } = useDogs();
  const [addDogOpen, setAddDogOpen] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  const isDirty = firstName.trim() !== (user?.firstName ?? '') || lastName.trim() !== (user?.lastName ?? '');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(firstName.trim(), lastName.trim());
      toast.success('Profil mis à jour avec succès');
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* User info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mon profil</CardTitle>
          <Button size="sm" onClick={handleSave} disabled={saving || !isDirty || !firstName.trim() || !lastName.trim()}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                maxLength={40}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                maxLength={30}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mes chiens</CardTitle>
          {dogs && dogs.length > 0 && (
            <Button size="sm" onClick={() => setAddDogOpen(true)}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Ajouter
            </Button>
          )}
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
