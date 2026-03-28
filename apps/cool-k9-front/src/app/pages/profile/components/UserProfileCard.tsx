import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@authentication';
import { type CardHandle } from '../models/profile.types';

export const UserProfileCard = forwardRef<CardHandle, { onDirtyChange?: () => void }>(
  function UserProfileCard({ onDirtyChange }, ref) {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  const isDirty =
    firstName.trim() !== (user?.firstName ?? '') || lastName.trim() !== (user?.lastName ?? '');
  const canSave = isDirty && firstName.trim() !== '' && lastName.trim() !== '';

  useEffect(() => { onDirtyChange?.(); }, [isDirty]);

  useImperativeHandle(ref, () => ({
    isDirty,
    canSave,
    save: async () => {
      await updateProfile(firstName.trim(), lastName.trim());
    },
  }), [isDirty, canSave, firstName, lastName]);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
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
});
