import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Environment, Session, Weather } from '@models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SessionFormFields } from './SessionFormFields';
import { OBSERVATION_STATUS_LABELS, OBSERVATION_STATUS_VARIANTS } from '../constants/session.constants';
import { type SessionFormMode } from '../models/session.model';
import { sessionSchema, type SessionFormValues } from '../models/session.schema';
import { useUserAndDogOptions } from '../hooks/useUserAndDogOptions';
import { useCreateSession, useUpdateSession } from '../hooks/useSessions';
import { type LocationValue } from '../models/location.model';

function sessionToDefaultValues(session?: Session): Partial<SessionFormValues> {
  if (!session) {
    return { userIds: [], dogIds: [], date: new Date() };
  }
  return {
    userIds: session.userIds,
    dogIds: session.dogIds ?? [],
    date: new Date(session.date),
    duration: session.duration,
    exerciseType: session.exerciseType,
    environment: session.environment,
    weather: session.weather,
    locationDisplay: session.location ?? '',
    locationLat: session.locationLat ?? null,
    locationLon: session.locationLon ?? null,
    route: session.route ?? '',
    previousObjectives: session.previousObjectives ?? '',
    trainerObservations: session.trainerObservations ?? '',
    nextObjectives: session.nextObjectives ?? '',
  };
}

export function SessionForm({ mode, session }: { mode: SessionFormMode; session?: Session }) {
  const isEdit = mode === 'admin-edit';
  const navigate = useNavigate();
  const [dateOpen, setDateOpen] = useState(false);

  const { register, control, handleSubmit, setValue, formState: { errors, isDirty, isSubmitting } } =
    useForm<SessionFormValues>({
      resolver: zodResolver(sessionSchema),
      defaultValues: sessionToDefaultValues(session),
    });

  const selectedUserIds = useWatch({ control, name: 'userIds', defaultValue: [] });
  const options = useUserAndDogOptions(selectedUserIds, isEdit, session);

  // Auto-select dog when user has exactly one
  useEffect(() => {
    if (options.autoSelectedDogIds.length === 0) return;
    const current = (control._formValues as SessionFormValues).dogIds ?? [];
    const toAdd = options.autoSelectedDogIds.filter(id => !current.includes(id));
    const toRemove = current.filter(
      id => !options.availableDogs.some((d: { id: string }) => d.id === id)
    );
    if (toAdd.length > 0 || toRemove.length > 0) {
      setValue('dogIds', [
        ...current.filter(id => !toRemove.includes(id)),
        ...toAdd,
      ]);
    }
  }, [options.autoSelectedDogIds, options.availableDogs]);

  const createSession = useCreateSession();
  const updateSession = useUpdateSession(session?.id ?? '');
  const isPending = isEdit ? updateSession.isPending : createSession.isPending;

  const buildPayload = (values: SessionFormValues) => ({
    date: values.date,
    userIds: values.userIds,
    dogIds: values.dogIds && values.dogIds.length > 0 ? values.dogIds : undefined,
    exerciseType: values.exerciseType,
    duration: values.duration,
    environment: (values.environment || null) as Environment | null | undefined,
    weather: values.environment === Environment.OUTDOOR
      ? ((values.weather || null) as Weather | null | undefined)
      : null,
    location: values.locationDisplay?.trim() || null,
    locationLat: values.locationLat ?? null,
    locationLon: values.locationLon ?? null,
    route: values.route?.trim() || null,
    previousObjectives: values.previousObjectives?.trim() || null,
    trainerObservations: values.trainerObservations?.trim() || null,
    nextObjectives: values.nextObjectives?.trim() || null,
  });

  const onSubmit = (values: SessionFormValues) => {
    const payload = buildPayload(values);
    if (isEdit) {
      updateSession.mutate(payload as Parameters<typeof updateSession.mutate>[0], {
        onSuccess: () => {
          toast.success('Séance mise à jour avec succès !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la mise à jour. Veuillez réessayer.'),
      });
    } else {
      createSession.mutate(payload as Parameters<typeof createSession.mutate>[0], {
        onSuccess: () => {
          toast.success('Séance créée avec succès !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la création de la séance. Veuillez réessayer.'),
      });
    }
  };

  const handleLocationChange = (coords: LocationValue | null, displayName: string) => {
    setValue('locationDisplay', displayName);
    setValue('locationLat', coords?.lat ?? null);
    setValue('locationLon', coords?.lon ?? null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <SessionFormFields
        control={control}
        register={register}
        errors={errors}
        dateOpen={dateOpen}
        onDateOpenChange={setDateOpen}
        userOptions={options.userOptions}
        usersLoading={options.usersLoading}
        hasNextPage={options.hasNextPage}
        onFetchNextPage={options.onFetchNextPage}
        onUsersSearchChange={options.onUsersSearchChange}
        onUsersOpenChange={options.onUsersOpenChange}
        dogOptions={options.dogOptions}
        dogsLoading={options.dogsLoading}
        infoHeaderAction={
          isEdit && session?.observationStatus ? (
            <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
              {OBSERVATION_STATUS_LABELS[session.observationStatus]}
            </Badge>
          ) : undefined
        }
        ownerObservationsReadOnly={isEdit ? session?.ownerObservations : undefined}
        isEditMode={isEdit}
        onLocationChange={handleLocationChange}
      />

      <Button
        type="submit"
        className="flex-1"
        disabled={isPending || isSubmitting || (isEdit ? !isDirty : false)}
        aria-busy={isPending}
      >
        {isPending || isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {isEdit ? 'Enregistrement...' : 'Création...'}
          </>
        ) : (
          isEdit ? 'Enregistrer' : 'Créer la séance'
        )}
      </Button>
    </form>
  );
}
