import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@authentication';
import { toast } from 'sonner';

export function UserProfileCard() {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  const isDirty =
    firstName.trim() !== (user?.firstName ?? '') || lastName.trim() !== (user?.lastName ?? '');

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mon profil</CardTitle>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !isDirty || !firstName.trim() || !lastName.trim()}
        >
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
  );
}
