import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog as DogModel, Environment, ExerciseType, Session, Weather } from '@models';
import { useUpdateSession } from '@/app/features/sessions/hooks/useSessions';
import { useMultiUserDogs } from '@/app/features/dogs/hooks/useDogs';
import { useUserSearch } from '@/app/features/profile/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { SessionFormFields } from './SessionFormFields';
import { OBSERVATION_STATUS_LABELS, OBSERVATION_STATUS_VARIANTS } from '../constants/session.constants';
import { type LocationValue } from './LocationAutocomplete';

export function AdminSessionForm({ session }: { session: Session }) {
  const navigate = useNavigate();
  const updateSession = useUpdateSession(session.id);

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

  // session est garanti non-null ici (le parent attend isLoading=false avant de rendre ce composant)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(session.userIds);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>(session.dogIds);
  const [date, setDate] = useState<Date>(new Date(session.date));
  const [dateOpen, setDateOpen] = useState(false);
  const [duration, setDuration] = useState(String(session.duration));
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>(session.exerciseType ?? '');
  const [environment, setEnvironment] = useState<Environment | ''>(session.environment ?? '');
  const [weather, setWeather] = useState<Weather | ''>(session.weather ?? '');
  const [location, setLocation] = useState<{ display: string; coords: LocationValue | null }>({
    display: session.location ?? '',
    coords: null,
  });
  const [route, setRoute] = useState(session.route ?? '');
  const [previousObjectives, setPreviousObjectives] = useState(session.previousObjectives ?? '');
  const [trainerObservations, setTrainerObservations] = useState(session.trainerObservations ?? '');
  const [nextObjectives, setNextObjectives] = useState(session.nextObjectives ?? '');

  const { data: availableDogs, isLoading: dogsLoading } = useMultiUserDogs(selectedUserIds);

  const searchedOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.data)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  const initialUserOptions: MultiSelectOption[] = session.userIds.map((id, i) => ({
    value: id,
    label: session.userNames?.[i] ?? id,
  }));

  const userOptions: MultiSelectOption[] = [
    ...initialUserOptions,
    ...searchedOptions.filter(o => !initialUserOptions.some(io => io.value === o.value)),
  ];

  const dogOptions: MultiSelectOption[] = availableDogs.map((d: DogModel) => ({
    value: d.id,
    label: d.name,
    sublabel: `${Math.floor((Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`,
  }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSession.mutate(
      {
        date: date as unknown as Date,
        userIds: selectedUserIds,
        dogIds: selectedDogIds,
        exerciseType: exerciseType as ExerciseType,
        duration: parseInt(duration, 10),
        environment: (environment || null) as Environment | null | undefined,
        weather:
          environment === Environment.OUTDOOR
            ? ((weather || null) as Weather | null | undefined)
            : null,
        location: location.display.trim() || null,
        locationLat: location.coords?.lat ?? null,
        locationLon: location.coords?.lon ?? null,
        route: route.trim() || null,
        previousObjectives: previousObjectives.trim() || null,
        trainerObservations: trainerObservations.trim() || null,
        nextObjectives: nextObjectives.trim() || null,
      } as Parameters<typeof updateSession.mutate>[0],
      {
        onSuccess: () => {
          toast.success('Séance mise à jour avec succès !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la mise à jour. Veuillez réessayer.'),
      }
    );
  };

  const sort = (arr: string[]) => [...arr].sort().join(',');
  const isDirty =
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
    nextObjectives.trim() !== (session.nextObjectives ?? '');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SessionFormFields
        infoHeaderAction={
          session.observationStatus && (
            <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
              {OBSERVATION_STATUS_LABELS[session.observationStatus]}
            </Badge>
          )
        }
        userOptions={userOptions}
        selectedUserIds={selectedUserIds}
        onUsersChange={setSelectedUserIds}
        usersLoading={usersLoading}
        hasNextPage={hasNextPage}
        onFetchNextPage={() => fetchNextPage()}
        onUsersSearchChange={setUsersSearch}
        onUsersOpenChange={setUsersOpen}
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
          }
        }}
        duration={duration}
        onDurationChange={setDuration}
        exerciseType={exerciseType}
        onExerciseTypeChange={v => setExerciseType(v as ExerciseType)}
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
        ownerObservationsReadOnly={session.ownerObservations}
        trainerObservations={trainerObservations}
        onTrainerObservationsChange={setTrainerObservations}
        nextObjectives={nextObjectives}
        onNextObjectivesChange={setNextObjectives}
        isEditMode
      />

      <Button
        type="submit"
        className="flex-1"
        disabled={updateSession.isPending || !isDirty}
        aria-busy={updateSession.isPending}
      >
        {updateSession.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer'
        )}
      </Button>
    </form>
  );
}
