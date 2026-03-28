import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog as DogModel, Environment, ExerciseType, Session, Weather } from '@models';
import { useUpdateSession } from '@/app/hooks/useSessions';
import { useMultiUserDogs } from '@/app/hooks/useDogs';
import { useUserSearch } from '@/app/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { SessionFormFields } from './SessionFormFields';
import {
  OBSERVATION_STATUS_LABELS,
  OBSERVATION_STATUS_VARIANTS,
} from '../models/session-form.types';
import { type LocationValue } from '@/app/components/LocationAutocomplete';
import { getExerciseTypeData } from '@/app/utils/exercise-type';

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
  const [initialized, setInitialized] = useState(false);

  const { data: availableDogs, isLoading: dogsLoading } = useMultiUserDogs(selectedUserIds);

  useEffect(() => {
    if (initialized) return;
    setSelectedUserIds(session.userIds);
    setSelectedDogIds(session.dogIds);
    setDate(new Date(session.date));
    setDuration(String(session.duration));
    setExerciseType(session.exerciseType);
    setEnvironment(session.environment ?? '');
    setWeather(session.weather ?? '');
    setLocation({ display: session.location ?? '', coords: null });
    setRoute(session.route ?? '');
    setPreviousObjectives(session.previousObjectives ?? '');
    setTrainerObservations(session.trainerObservations ?? '');
    setNextObjectives(session.nextObjectives ?? '');
    setInitialized(true);
  }, [session, initialized]);

  const searchedOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.users)
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

  const exerciseTypeData = getExerciseTypeData(session.exerciseType);

  const formatDateLong = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Modifier la séance</CardTitle>
              <CardDescription className="capitalize mt-1">
                {formatDateLong(session.date)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Badge variant={exerciseTypeData.variant}>{exerciseTypeData.label}</Badge>
              {session.observationStatus && (
                <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
                  {OBSERVATION_STATUS_LABELS[session.observationStatus]}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SessionFormFields
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

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
              disabled={updateSession.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateSession.isPending}
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
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
