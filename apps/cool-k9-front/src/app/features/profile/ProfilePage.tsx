import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserProfileCard } from './components/UserProfileCard';
import { DogsCard } from './components/DogsCard';
import { type CardHandle } from './models/profile.model';

export function ProfilePage() {
  const profileRef = useRef<CardHandle>(null);
  const dogsRef = useRef<CardHandle>(null);
  const [saving, setSaving] = useState(false);
  const [, forceUpdate] = useState(0);

  const isDirty = (profileRef.current?.isDirty || dogsRef.current?.isDirty) ?? false;
  const canSave =
    (!profileRef.current?.isDirty || (profileRef.current?.canSave ?? true)) &&
    (!dogsRef.current?.isDirty || (dogsRef.current?.canSave ?? true)) &&
    isDirty;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profileRef.current?.isDirty) await profileRef.current.save();
      if (dogsRef.current?.isDirty) await dogsRef.current.save();
      toast.success('Modifications enregistrées !');
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !canSave}
          aria-busy={saving}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>

      <UserProfileCard ref={profileRef} onDirtyChange={() => forceUpdate(n => n + 1)} />
      <DogsCard ref={dogsRef} onDirtyChange={() => forceUpdate(n => n + 1)} />
    </div>
  );
}
