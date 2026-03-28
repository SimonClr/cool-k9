import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Dog as DogModel, Environment, ExerciseType, ObservationStatus, Weather } from '@models';
import { useSession, useUpdateSession } from '@/app/hooks/useSessions';
import { useMultiUserDogs } from '@/app/hooks/useDogs';
import { useUserSearch } from '@/app/hooks/useUsers';
import { useAuth } from '@authentication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  Clock,
  Cloud,
  Dog,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Target,
  Thermometer,
  User,
} from 'lucide-react';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { SessionFormFields } from './SessionFormFields';
import { OBSERVATION_STATUS_LABELS, OBSERVATION_STATUS_VARIANTS } from './session-form.types';
import { type LocationValue } from '@/app/components/LocationAutocomplete';
import { ENVIRONMENT_LABELS, WEATHER_LABELS } from '@/app/utils/session-labels';
import { getExerciseTypeData } from '@/app/utils/exercise-type'; // ─── SectionCard ──────────────────────────────────────────────────────────────

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{children}</p>
      </CardContent>
    </Card>
  );
}

// ─── EditSessionForm ──────────────────────────────────────────────────────────

export function EditSessionForm({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: session, isLoading, isError } = useSession(sessionId);
  const updateSession = useUpdateSession(sessionId);

  const isAdmin = !!user?.isAdmin;
  const isSingleOwner = (session?.userIds.length ?? 0) === 1;
  const canEditOwnerObs = !isAdmin && isSingleOwner;

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
  } = useUserSearch(debouncedSearch, usersOpen && isAdmin);

  const searchedOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.users)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  const initialUserOptions: MultiSelectOption[] = (session?.userIds ?? []).map((id, i) => ({
    value: id,
    label: session?.userNames?.[i] ?? id,
  }));

  const userOptions: MultiSelectOption[] = [
    ...initialUserOptions,
    ...searchedOptions.filter(o => !initialUserOptions.some(io => io.value === o.value)),
  ];

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
  const [ownerObservations, setOwnerObservations] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: availableDogs, isLoading: dogsLoading } = useMultiUserDogs(
    isAdmin ? selectedUserIds : []
  );

  useEffect(() => {
    if (!session || initialized) return;
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
    setOwnerObservations(session.ownerObservations ?? '');
    setInitialized(true);
  }, [session, initialized]);

  const dogOptions: MultiSelectOption[] = availableDogs.map((d: DogModel) => ({
    value: d.id,
    label: d.name,
    sublabel: `${Math.floor((Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`,
  }));

  const handleAdminSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
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
        onSuccess: () => navigate('/sessions', { replace: true }),
        onError: () => setApiError('Erreur lors de la mise à jour. Veuillez réessayer.'),
      }
    );
  };

  const handleUserSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    updateSession.mutate(
      { ownerObservations: ownerObservations.trim() || null } as Parameters<
        typeof updateSession.mutate
      >[0],
      {
        onSuccess: () => navigate('/sessions', { replace: true }),
        onError: () => setApiError('Erreur lors de la mise à jour. Veuillez réessayer.'),
      }
    );
  };

  if (isLoading) {
    return (
      <div
        aria-live="polite"
        aria-busy="true"
        className="flex items-center justify-center gap-2 text-muted-foreground py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (isError || !session) {
    return <Navigate to="/sessions" replace />;
  }

  if (!initialized) {
    return (
      <div
        aria-live="polite"
        aria-busy="true"
        className="flex items-center justify-center gap-2 text-muted-foreground py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  const exerciseTypeData = getExerciseTypeData(session.exerciseType);
  const showTrainerObservations = session.observationStatus !== ObservationStatus.WAITING_OWNER;

  const formatDateLong = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);

  // ── Admin edit view ──
  if (isAdmin) {
    return (
      <form onSubmit={handleAdminSubmit} className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant={exerciseTypeData.variant}>{exerciseTypeData.label}</Badge>
          {session.observationStatus && (
            <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
              {OBSERVATION_STATUS_LABELS[session.observationStatus]}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modifier la séance</CardTitle>
            <CardDescription className="capitalize">{formatDateLong(session.date)}</CardDescription>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div role="alert" className="flex items-center gap-2 text-destructive text-sm mb-5">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{apiError}</span>
              </div>
            )}

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

  // ── User read-only view ──
  return (
    <form onSubmit={handleUserSubmit} className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold capitalize">{formatDateLong(session.date)}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant={exerciseTypeData.variant}>{exerciseTypeData.label}</Badge>
            {session.observationStatus && (
              <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
                {OBSERVATION_STATUS_LABELS[session.observationStatus]}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {apiError && (
        <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Dog className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="font-medium">{session.dogNames.join(', ') || '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>{session.userNames?.join(', ') || '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>{session.duration} min</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{session.location}</span>
            </div>
          )}
          {session.environment && (
            <div className="flex items-center gap-3 text-sm">
              <Cloud className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{ENVIRONMENT_LABELS[session.environment]}</span>
            </div>
          )}
          {session.environment === Environment.OUTDOOR && session.weather && (
            <div className="flex items-center gap-3 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{WEATHER_LABELS[session.weather]}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {session.route && session.environment === Environment.OUTDOOR && (
          <SectionCard icon={<MapPin className="h-4 w-4" aria-hidden="true" />} title="Parcours">
            {session.route}
          </SectionCard>
        )}

        {session.previousObjectives && (
          <SectionCard
            icon={<Target className="h-4 w-4" aria-hidden="true" />}
            title="Objectifs séance précédente"
          >
            {session.previousObjectives}
          </SectionCard>
        )}

        {canEditOwnerObs ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Observations propriétaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="ownerObservations"
                placeholder="Vos observations après la séance..."
                value={ownerObservations}
                onChange={e => setOwnerObservations(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        ) : (
          session.ownerObservations && (
            <SectionCard
              icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
              title="Observations propriétaire"
            >
              {session.ownerObservations}
            </SectionCard>
          )
        )}

        {showTrainerObservations && session.trainerObservations && (
          <SectionCard
            icon={<FileText className="h-4 w-4" aria-hidden="true" />}
            title="Observations dresseur"
          >
            {session.trainerObservations}
          </SectionCard>
        )}

        {session.nextObjectives && (
          <SectionCard
            icon={<Target className="h-4 w-4" aria-hidden="true" />}
            title="Objectifs prochaine séance"
          >
            {session.nextObjectives}
          </SectionCard>
        )}
      </div>

      {canEditOwnerObs && (
        <div className="flex gap-3 mt-2">
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
      )}
    </form>
  );
}
