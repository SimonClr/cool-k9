import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@authentication';
import { type CardHandle } from '../models/profile.model';
import { profileSchema, type ProfileFormValues } from '../models/profile.schema';

export const UserProfileCard = forwardRef<CardHandle, { onDirtyChange?: (isDirty: boolean) => void }>(
  function UserProfileCard({ onDirtyChange }, ref) {
  const { user, updateProfile } = useAuth();

  const { register, handleSubmit, formState: { isDirty, isValid } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);

  useImperativeHandle(ref, () => ({
    isDirty,
    canSave: isDirty && isValid,
    save: handleSubmit(async ({ firstName, lastName }) => {
      await updateProfile(firstName.trim(), lastName.trim());
    }),
  }), [isDirty, isValid]);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              maxLength={40}
              {...register('firstName')}
              autoComplete="given-name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              maxLength={30}
              {...register('lastName')}
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
