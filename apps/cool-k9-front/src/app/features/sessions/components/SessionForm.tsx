import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog as DogModel, Environment, ExerciseType, Session, Weather } from '@models';
import { useCreateSession, useUpdateSession } from '@/app/features/sessions/hooks/useSessions';
import { useMultiUserDogs } from '@/app/features/dogs/hooks/useDogs';
import { useUserSearch } from '@/app/features/profile/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { SessionFormFields } from './SessionFormFields';
import { type FieldErrors } from '../models/session.model';
import { OBSERVATION_STATUS_LABELS, OBSERVATION_STATUS_VARIANTS } from '../constants/session.constants';
import { type LocationValue } from './LocationAutocomplete';

export function SessionForm({ session }: { session?: Session }) {
  const navigate = useNavigate();
  const isEdit = !!session;

  const createSession = useCreateSession();
  const updateSession = useUpdateSession(session?.id ?? '');

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(usersSearch), 300);
    return () => clearTimeout(t);
  }, [usersSearch]);

  const { data: usersPages, isLoading: usersLoading, hasNextPage, fetchNextPage } =
    useUserSearch(debouncedSearch, usersOpen);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(session?.userIds ?? []);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>(session?.dogIds ?? []);
  const [date, setDate] = useState<Date>(session ? new Date(session.date) : new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [duration, setDuration] = useState(session ? String(session.duration) : '');
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>(session?.exerciseType ?? '');
  const [environment, setEnvironment] = useState<Environment | ''>(session?.environment ?? '');
  const [weather, setWeather] = useState<Weather | ''>(session?.weather ?? '');
  const [location, setLocation] = useState<{ display: string; coords: LocationValue | null }>({
    display: session?.location ?? '',
    coords: null,
  });
  const [route, setRoute] = useState(session?.route ?? '');
  const [previousObjectives, setPreviousObjectives] = useState(session?.previousObjectives ?? '');
  const [trainerObservations, setTrainerObservations] = useState(session?.trainerObservations ?? '');
  const [nextObjectives, setNextObjectives] = useState(session?.nextObjectives ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: availableDogs, isLoading: dogsLoading } = useMultiUserDogs(selectedUserIds);

  useEffect(() => {
    if (isEdit || dogsLoading || availableDogs.length === 0) return;
    const autoSelected: string[] = [];
    selectedUserIds.forEach(uid => {
      const userDogs = availableDogs.filter((d: DogModel) => d.userId === uid);
      if (userDogs.length === 1) autoSelected.push(userDogs[0].id);
    });
    setSelectedDogIds(prev => {
      const stillAvailable = prev.filter(id => availableDogs.some((d: DogModel) => d.id === id));
      const newAuto = autoSelected.filter(id => !stillAvailable.includes(id));
      return [...stillAvailable, ...newAuto];
    });
  }, [availableDogs, dogsLoading, selectedUserIds, isEdit]);

  const searchedOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.users)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  const initialUserOptions: MultiSelectOption[] = isEdit
    ? (session.userIds.map((id, i) => ({
        value: id,
        label: session.userNames?.[i] ?? id,
      })))
    : [];

  const userOptions: MultiSelectOption[] = [
    ...initialUserOptions,
    ...searchedOptions.filter(o => !initialUserOptions.some(io => io.value === o.value)),
  ];

  const dogOptions: MultiSelectOption[] = availableDogs.map((d: DogModel) => ({
    value: d.id,
    label: d.name,
    sublabel: `${Math.floor((Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`,
  }));

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (selectedUserIds.length === 0) errors.userIds = 'Veuillez sélectionner au moins un client';
    if (!date) errors.date = 'La date est obligatoire';
    if (!duration) {
      errors.duration = 'La durée est obligatoire';
    } else {
      const parsed = parseInt(duration, 10);
      if (isNaN(parsed) || parsed < 1) errors.duration = 'La durée doit être supérieure à 0';
    }
    if (!exerciseType) errors.exerciseType = 'Le type de séance est obligatoire';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const sort = (arr: string[]) => [...arr].sort().join(',');
  const isDirty = isEdit && session ? (
    sort(selectedUserIds) !== sort(session.userIds) ||
    sort(selectedDogIds) !== sort(session.dogIds) ||
    date.toISOString().slice(0, 10) !== new Date(session.date).toISOString().slice(0, 10) ||
    duration !== String(session.duration) ||
    exerciseType !== (session.exerciseType ?? '') ||
    environment !== (session.environment ?? '') ||
    weather !== (session.weather ?? '') ||
    location.display.trim() !== (session.location ?? '') ||
    route.trim() !== (session.route ?? '') ||
    previousObjectives.trim() !== (session.previousObjectives ?? '') ||
    trainerObservations.trim() !== (session.trainerObservations ?? '') ||
    nextObjectives.trim() !== (session.nextObjectives ?? '')
  ) : true;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEdit && !validate()) return;

    const payload = {
      date: date as unknown as Date,
      userIds: selectedUserIds,
      dogIds: selectedDogIds.length > 0 ? selectedDogIds : undefined,
      exerciseType: exerciseType as ExerciseType,
      duration: parseInt(duration, 10),
      environment: (environment || null) as Environment | null | undefined,
      weather: environment === Environment.OUTDOOR ? ((weather || null) as Weather | null | undefined) : null,
      location: location.display.trim() || null,
      locationLat: location.coords?.lat ?? null,
      locationLon: location.coords?.lon ?? null,
      route: route.trim() || null,
      previousObjectives: previousObjectives.trim() || null,
      trainerObservations: trainerObservations.trim() || null,
      nextObjectives: nextObjectives.trim() || null,
    };

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

  const isPending = isEdit ? updateSession.isPending : createSession.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SessionFormFields
        infoHeaderAction={
          isEdit && session?.observationStatus ? (
            <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
              {OBSERVATION_STATUS_LABELS[session.observationStatus]}
            </Badge>
          ) : undefined
        }
        userOptions={userOptions}
        selectedUserIds={selectedUserIds}
        onUsersChange={ids => {
          setSelectedUserIds(ids);
          if (fieldErrors.userIds) setFieldErrors(p => ({ ...p, userIds: undefined }));
        }}
        usersLoading={usersLoading}
        hasNextPage={hasNextPage}
        onFetchNextPage={() => fetchNextPage()}
        onUsersSearchChange={setUsersSearch}
        onUsersOpenChange={setUsersOpen}
        userFieldError={fieldErrors.userIds}
        dogOptions={dogOptions}
        selectedDogIds={selectedDogIds}
        onDogsChange={setSelectedDogIds}
        dogsLoading={dogsLoading}
        date={date}
        dateOpen={dateOpen}
        onDateOpenChange={setDateOpen}
        onDateSelect={d => {
          if (d) {
            setDate(d);
            setDateOpen(false);
            if (fieldErrors.date) setFieldErrors(p => ({ ...p, date: undefined }));
          }
        }}
        dateFieldError={fieldErrors.date}
        duration={duration}
        onDurationChange={v => {
          setDuration(v);
          if (fieldErrors.duration) setFieldErrors(p => ({ ...p, duration: undefined }));
        }}
        durationFieldError={fieldErrors.duration}
        exerciseType={exerciseType}
        onExerciseTypeChange={v => {
          setExerciseType(v as ExerciseType);
          if (fieldErrors.exerciseType) setFieldErrors(p => ({ ...p, exerciseType: undefined }));
        }}
        exerciseTypeFieldError={fieldErrors.exerciseType}
        environment={environment}
        onEnvironmentChange={v => {
          setEnvironment(v as Environment);
          if (v !== Environment.OUTDOOR) setWeather('');
        }}
        weather={weather}
        onWeatherChange={v => setWeather(v as Weather)}
        locationDisplay={location.display}
        onLocationChange={(coords, display) => setLocation({ display, coords })}
        route={route}
        onRouteChange={setRoute}
        previousObjectives={previousObjectives}
        onPreviousObjectivesChange={setPreviousObjectives}
        ownerObservationsReadOnly={isEdit ? session?.ownerObservations : undefined}
        trainerObservations={trainerObservations}
        onTrainerObservationsChange={setTrainerObservations}
        nextObjectives={nextObjectives}
        onNextObjectivesChange={setNextObjectives}
        isEditMode={isEdit}
      />

      <Button
        type="submit"
        className="flex-1"
        disabled={isPending || (isEdit ? !isDirty : selectedUserIds.length === 0 || !duration || !exerciseType)}
        aria-busy={isPending}
      >
        {isPending ? (
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
