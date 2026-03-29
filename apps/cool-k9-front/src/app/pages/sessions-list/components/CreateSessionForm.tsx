import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog as DogModel, Environment, ExerciseType, Weather } from '@models';
import { useCreateSession } from '@/app/hooks/useSessions';
import { useMultiUserDogs } from '@/app/hooks/useDogs';
import { useUserSearch } from '@/app/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { SessionFormFields } from './SessionFormFields';
import { type FieldErrors } from '../models/session-form.types';
import { type LocationValue } from '@/app/components/LocationAutocomplete';

export function CreateSessionForm() {
  const navigate = useNavigate();
  const createSession = useCreateSession();

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(usersSearch), 300);
    return () => clearTimeout(t);
  }, [usersSearch]);

  const {
    data: usersPages,
    isLoading: usersLoading,
    hasNextPage,
    fetchNextPage,
  } = useUserSearch(debouncedSearch, usersOpen);

  const userOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.users)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [duration, setDuration] = useState('');
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>('');
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [weather, setWeather] = useState<Weather | ''>('');
  const [location, setLocation] = useState<{ display: string; coords: LocationValue | null }>({
    display: '',
    coords: null,
  });
  const [route, setRoute] = useState('');
  const [previousObjectives, setPreviousObjectives] = useState('');
  const [trainerObservations, setTrainerObservations] = useState('');
  const [nextObjectives, setNextObjectives] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: availableDogs, isLoading: dogsLoading } = useMultiUserDogs(selectedUserIds);

  useEffect(() => {
    if (dogsLoading || availableDogs.length === 0) return;
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
  }, [availableDogs, dogsLoading, selectedUserIds]);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createSession.mutate(
      {
        date: date as unknown as Date,
        userIds: selectedUserIds,
        dogIds: selectedDogIds.length > 0 ? selectedDogIds : undefined,
        exerciseType: exerciseType as ExerciseType,
        duration: parseInt(duration, 10),
        environment: (environment || undefined) as Environment | undefined,
        weather:
          environment === Environment.OUTDOOR
            ? ((weather || undefined) as Weather | undefined)
            : undefined,
        location: location.display.trim() || undefined,
        locationLat: location.coords?.lat,
        locationLon: location.coords?.lon,
        route: route.trim() || undefined,
        previousObjectives: previousObjectives.trim() || undefined,
        trainerObservations: trainerObservations.trim() || undefined,
        nextObjectives: nextObjectives.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Séance créée avec succès !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la création de la séance. Veuillez réessayer.'),
      }
    );
  };

  const dogOptions: MultiSelectOption[] = availableDogs.map((d: DogModel) => ({
    value: d.id,
    label: d.name,
    sublabel: `${Math.floor((Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SessionFormFields
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
        trainerObservations={trainerObservations}
        onTrainerObservationsChange={setTrainerObservations}
        nextObjectives={nextObjectives}
        onNextObjectivesChange={setNextObjectives}
      />

      <Button
        type="submit"
        className="flex-1"
        disabled={
          createSession.isPending || selectedUserIds.length === 0 || !duration || !exerciseType
        }
        aria-busy={createSession.isPending}
      >
        {createSession.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Création...
          </>
        ) : (
          'Créer la séance'
        )}
      </Button>
    </form>
  );
}
