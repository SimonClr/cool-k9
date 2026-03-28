import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Environment, ExerciseType, ObservationStatus, Weather } from '@models';
import { useSession, useCreateSession, useUpdateSession } from '../../hooks/useSessions';
import { useMultiUserDogs } from '../../hooks/useDogs';
import { useUserSearch } from '../../hooks/useUsers';
import { useAuth } from '@authentication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertCircle,
  ArrowLeft,
  CalendarIcon,
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LocationAutocomplete, LocationValue } from '../../components/LocationAutocomplete';
import { WEATHER_LABELS, ENVIRONMENT_LABELS } from '@/app/utils/session-labels';
import { EXERCISE_TYPE_LABELS, getExerciseTypeData } from '@/app/utils/exercise-type';
import { Dog as DogModel } from '@models';
import type { MultiSelectOption } from '@/components/ui/multi-select';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldErrors = {
  userIds?: string;
  date?: string;
  duration?: string;
  exerciseType?: string;
};

const OBSERVATION_STATUS_LABELS: Record<string, string> = {
  WAITING_OWNER: 'En attente propriétaire',
  WAITING_TRAINER: 'En attente dresseur',
  COMPLETE: 'Complète',
};

const OBSERVATION_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'warning' | 'success'> = {
  WAITING_OWNER: 'warning',
  WAITING_TRAINER: 'secondary',
  COMPLETE: 'success',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

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

// ─── Shared form fields (used in both create and admin-edit) ──────────────────

interface SessionFormFieldsProps {
  // Users
  userOptions: MultiSelectOption[];
  selectedUserIds: string[];
  onUsersChange: (ids: string[]) => void;
  usersLoading: boolean;
  hasNextPage: boolean | undefined;
  onFetchNextPage: () => void;
  onUsersSearchChange: (s: string) => void;
  onUsersOpenChange: (open: boolean) => void;
  userFieldError?: string;

  // Dogs
  dogOptions: MultiSelectOption[];
  selectedDogIds: string[];
  onDogsChange: (ids: string[]) => void;
  dogsLoading: boolean;

  // Date
  date: Date;
  dateOpen: boolean;
  onDateOpenChange: (open: boolean) => void;
  onDateSelect: (d: Date | undefined) => void;
  dateFieldError?: string;

  // Duration
  duration: string;
  onDurationChange: (v: string) => void;
  durationFieldError?: string;

  // Exercise type
  exerciseType: ExerciseType | '';
  onExerciseTypeChange: (v: string) => void;
  exerciseTypeFieldError?: string;

  // Environment / weather
  environment: Environment | '';
  onEnvironmentChange: (v: string) => void;
  weather: Weather | '';
  onWeatherChange: (v: string) => void;

  // Location
  locationDisplay: string;
  onLocationChange: (coords: LocationValue | null, display: string) => void;

  // Text areas
  route: string;
  onRouteChange: (v: string) => void;
  previousObjectives: string;
  onPreviousObjectivesChange: (v: string) => void;
  ownerObservationsReadOnly?: string | null; // edit mode: show as disabled
  ownerObservations?: string;
  onOwnerObservationsChange?: (v: string) => void;
  trainerObservations: string;
  onTrainerObservationsChange: (v: string) => void;
  nextObjectives: string;
  onNextObjectivesChange: (v: string) => void;

  isEditMode?: boolean;
}

function SessionFormFields({
  userOptions,
  selectedUserIds,
  onUsersChange,
  usersLoading,
  hasNextPage,
  onFetchNextPage,
  onUsersSearchChange,
  onUsersOpenChange,
  userFieldError,
  dogOptions,
  selectedDogIds,
  onDogsChange,
  dogsLoading,
  date,
  dateOpen,
  onDateOpenChange,
  onDateSelect,
  dateFieldError,
  duration,
  onDurationChange,
  durationFieldError,
  exerciseType,
  onExerciseTypeChange,
  exerciseTypeFieldError,
  environment,
  onEnvironmentChange,
  weather,
  onWeatherChange,
  locationDisplay,
  onLocationChange,
  route,
  onRouteChange,
  previousObjectives,
  onPreviousObjectivesChange,
  ownerObservationsReadOnly,
  ownerObservations,
  onOwnerObservationsChange,
  trainerObservations,
  onTrainerObservationsChange,
  nextObjectives,
  onNextObjectivesChange,
  isEditMode = false,
}: SessionFormFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Utilisateurs */}
      <div className="flex flex-col gap-1.5">
        <Label>Utilisateurs</Label>
        <MultiSelect
          options={userOptions}
          selected={selectedUserIds}
          onChange={onUsersChange}
          placeholder="Sélectionner des utilisateurs"
          searchPlaceholder="Rechercher un utilisateur..."
          hasError={!!userFieldError}
          onSearchChange={onUsersSearchChange}
          isLoading={usersLoading}
          hasMore={hasNextPage}
          onLoadMore={onFetchNextPage}
          onOpenChange={onUsersOpenChange}
        />
        {userFieldError && <FieldError id="userIds-error" message={userFieldError} />}
      </div>

      {/* Chiens */}
      {selectedUserIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Chiens</Label>
          <MultiSelect
            options={dogOptions}
            selected={selectedDogIds}
            onChange={onDogsChange}
            placeholder={
              dogsLoading
                ? 'Chargement...'
                : dogOptions.length === 0
                ? 'Aucun chien enregistré'
                : 'Sélectionner des chiens'
            }
            searchPlaceholder="Rechercher un chien..."
            disabled={dogsLoading || dogOptions.length === 0}
          />
        </div>
      )}

      {/* Date + Durée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Date</Label>
          <Popover open={dateOpen} onOpenChange={onDateOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-invalid={!!dateFieldError}
                aria-describedby={dateFieldError ? 'date-error' : undefined}
                className={cn(
                  'justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                  dateFieldError && 'border-destructive'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                {date ? format(date, 'PPP', { locale: fr }) : 'Choisir une date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateSelect}
                locale={fr}
                classNames={{ root: 'w-full' }}
              />
            </PopoverContent>
          </Popover>
          {dateFieldError && <FieldError id="date-error" message={dateFieldError} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="duration">Durée (min)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            placeholder="60"
            value={duration}
            onChange={e => onDurationChange(e.target.value)}
            aria-invalid={!!durationFieldError}
            aria-describedby={durationFieldError ? 'duration-error' : undefined}
            className={durationFieldError ? 'border-destructive' : ''}
          />
          {durationFieldError && <FieldError id="duration-error" message={durationFieldError} />}
        </div>
      </div>

      {/* Type de séance */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exerciseType">Type de séance</Label>
        <Select value={exerciseType} onValueChange={onExerciseTypeChange}>
          <SelectTrigger
            id="exerciseType"
            aria-invalid={!!exerciseTypeFieldError}
            aria-describedby={exerciseTypeFieldError ? 'exerciseType-error' : undefined}
            className={cn(exerciseTypeFieldError && 'border-destructive')}
          >
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXERCISE_TYPE_LABELS).map(([value, data]) => (
              <SelectItem key={value} value={value}>
                {data.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {exerciseTypeFieldError && (
          <FieldError id="exerciseType-error" message={exerciseTypeFieldError} />
        )}
      </div>

      {/* Lieu */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Lieu</Label>
        <LocationAutocomplete
          id="location"
          value={locationDisplay}
          onChange={(coords, displayName) => onLocationChange(coords, displayName)}
          placeholder="Parc de la Tête d'Or, Lyon"
        />
      </div>

      {/* Environnement + Météo (Météo visible uniquement si extérieur) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="environment">Environnement</Label>
          <Select value={environment} onValueChange={onEnvironmentChange}>
            <SelectTrigger id="environment">
              <SelectValue placeholder="— Non défini —" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ENVIRONMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {environment === Environment.OUTDOOR && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weather">Météo</Label>
            <Select value={weather} onValueChange={onWeatherChange}>
              <SelectTrigger id="weather">
                <SelectValue placeholder="— Non défini —" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WEATHER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Parcours — visible uniquement si extérieur */}
      {environment === Environment.OUTDOOR && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="route">Parcours</Label>
          <Textarea
            id="route"
            placeholder="Description du parcours..."
            value={route}
            onChange={e => onRouteChange(e.target.value)}
          />
        </div>
      )}

      {/* Objectifs séance précédente */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="previousObjectives">Objectifs séance précédente</Label>
        <Textarea
          id="previousObjectives"
          placeholder="Objectifs de la séance précédente..."
          value={previousObjectives}
          onChange={e => onPreviousObjectivesChange(e.target.value)}
        />
      </div>

      {/* Observations propriétaire */}
      {isEditMode ? (
        // Edit mode: read-only for admin
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ownerObservations">Observations propriétaire</Label>
          <Textarea
            id="ownerObservations"
            value={ownerObservationsReadOnly ?? ''}
            readOnly
            disabled
            placeholder="Aucune observation"
            className="resize-none text-muted-foreground"
          />
        </div>
      ) : (
        // Create mode: editable
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ownerObservations">Observations propriétaire</Label>
          <Textarea
            id="ownerObservations"
            placeholder="Observations du propriétaire après la séance..."
            value={ownerObservations ?? ''}
            onChange={e => onOwnerObservationsChange?.(e.target.value)}
          />
        </div>
      )}

      {/* Observations dresseur */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="trainerObservations">Observations dresseur</Label>
        <Textarea
          id="trainerObservations"
          placeholder="Observations du dresseur..."
          value={trainerObservations}
          onChange={e => onTrainerObservationsChange(e.target.value)}
        />
      </div>

      {/* Objectifs prochaine séance */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nextObjectives">Objectifs prochaine séance</Label>
        <Textarea
          id="nextObjectives"
          placeholder="Objectifs à atteindre lors de la prochaine séance..."
          value={nextObjectives}
          onChange={e => onNextObjectivesChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Create mode ─────────────────────────────────────────────────────────────

function CreateSessionForm() {
  const navigate = useNavigate();
  const createSession = useCreateSession();

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(usersSearch), 300);
    return () => clearTimeout(t);
  }, [usersSearch]);

  const { data: usersPages, isLoading: usersLoading, hasNextPage, fetchNextPage } =
    useUserSearch(debouncedSearch, usersOpen);

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
  const [location, setLocation] = useState<{ display: string; coords: LocationValue | null }>({ display: '', coords: null });
  const [route, setRoute] = useState('');
  const [previousObjectives, setPreviousObjectives] = useState('');
  const [ownerObservations, setOwnerObservations] = useState('');
  const [trainerObservations, setTrainerObservations] = useState('');
  const [nextObjectives, setNextObjectives] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

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
    if (selectedUserIds.length === 0) errors.userIds = 'Veuillez sélectionner au moins un utilisateur';
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
    setApiError(null);
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
        ownerObservations: ownerObservations.trim() || undefined,
        trainerObservations: trainerObservations.trim() || undefined,
        nextObjectives: nextObjectives.trim() || undefined,
      },
      {
        onSuccess: () => navigate('/sessions', { replace: true }),
        onError: () => setApiError('Erreur lors de la création de la séance. Veuillez réessayer.'),
      }
    );
  };

  const dogOptions: MultiSelectOption[] = availableDogs.map((d: DogModel) => ({
    value: d.id,
    label: d.name,
    sublabel: `${d.age} ans`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle séance</CardTitle>
        <CardDescription>Renseignez les informations de la séance d'entraînement</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {apiError && (
            <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{apiError}</span>
            </div>
          )}

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
            ownerObservations={ownerObservations}
            onOwnerObservationsChange={setOwnerObservations}
            trainerObservations={trainerObservations}
            onTrainerObservationsChange={setTrainerObservations}
            nextObjectives={nextObjectives}
            onNextObjectivesChange={setNextObjectives}
          />

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
              disabled={createSession.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createSession.isPending}
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Edit mode ────────────────────────────────────────────────────────────────

function EditSessionForm({ sessionId }: { sessionId: string }) {
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

  const { data: usersPages, isLoading: usersLoading, hasNextPage, fetchNextPage } =
    useUserSearch(debouncedSearch, usersOpen && isAdmin);

  // Build user options, always including current session users so chips display correctly
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
  const [location, setLocation] = useState<{ display: string; coords: LocationValue | null }>({ display: '', coords: null });
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
    sublabel: `${d.age} ans`,
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
      { ownerObservations: ownerObservations.trim() || null } as Parameters<typeof updateSession.mutate>[0],
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
        {/* Badges header */}
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
              onDateSelect={d => { if (d) { setDate(d); setDateOpen(false); } }}
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

  // ── User read-only view (with optional ownerObservations edit) ──
  return (
    <form onSubmit={handleUserSubmit} className="flex flex-col gap-6">
      {/* Header */}
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

      {/* Infos générales */}
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

      {/* Sections texte */}
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

        {/* Observations propriétaire */}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export function SessionFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  return (
    <div className="container mx-auto max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Mes séances
      </Button>

      {isEditMode ? <EditSessionForm sessionId={id} /> : <CreateSessionForm />}
    </div>
  );
}
