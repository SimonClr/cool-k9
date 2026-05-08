import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog as DogModel, Environment, ExerciseType, Session, Weather } from '@models';
import { toast } from 'sonner';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { useCreateSession, useUpdateSession } from './useSessions';
import { useMultiUserDogs } from '@/app/features/dogs/hooks/useDogs';
import { useUserSearch } from '@/app/features/profile/hooks/useUsers';
import { type LocationValue } from '../models/location.model';
import { type FieldErrors } from '../models/session.model';

export type SessionFormMode = 'create' | 'admin-edit';

export function useSessionForm(mode: SessionFormMode, session?: Session) {
  const navigate = useNavigate();
  const isEdit = mode === 'admin-edit';

  const createSession = useCreateSession();
  const updateSession = useUpdateSession(session?.id ?? '');

  // Users search
  const [usersOpen, setUsersOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(usersSearch), 300);
    return () => clearTimeout(t);
  }, [usersSearch]);

  const { data: usersPages, isLoading: usersLoading, hasNextPage, fetchNextPage } =
    useUserSearch(debouncedSearch, usersOpen);

  // Form state
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

  // Dogs auto-select
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

  // Options
  const searchedOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.data)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  const initialUserOptions: MultiSelectOption[] = isEdit && session
    ? session.userIds.map((id, i) => ({
        value: id,
        label: session.userNames?.[i] ?? id,
      }))
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

  // Validation (create only)
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

  // Dirty detection
  const sort = (arr: string[]) => [...arr].sort().join(',');
  const isDirty = isEdit && session
    ? sort(selectedUserIds) !== sort(session.userIds) ||
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
    : true;

  const buildPayload = () => ({
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
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEdit && !validate()) return;

    const payload = buildPayload();

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

  return {
    // User search
    userOptions,
    usersLoading,
    hasNextPage,
    fetchNextPage,
    setUsersSearch,
    setUsersOpen,
    // Dog options
    dogOptions,
    dogsLoading,
    // Form fields
    selectedUserIds,
    setSelectedUserIds,
    selectedDogIds,
    setSelectedDogIds,
    date,
    setDate,
    dateOpen,
    setDateOpen,
    duration,
    setDuration,
    exerciseType,
    setExerciseType,
    environment,
    setEnvironment,
    weather,
    setWeather,
    location,
    setLocation,
    route,
    setRoute,
    previousObjectives,
    setPreviousObjectives,
    trainerObservations,
    setTrainerObservations,
    nextObjectives,
    setNextObjectives,
    fieldErrors,
    setFieldErrors,
    // Computed
    isDirty,
    isPending,
    handleSubmit,
  };
}
