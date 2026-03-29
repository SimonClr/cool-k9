import { Environment, ExerciseType, Weather } from '@models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LocationAutocomplete, LocationValue } from '@/app/components/LocationAutocomplete';
import { ENVIRONMENT_LABELS, WEATHER_LABELS } from '@/app/utils/session-labels';
import { EXERCISE_TYPE_LABELS } from '@/app/utils/exercise-type';

// ─── FieldError ───────────────────────────────────────────────────────────────

export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SessionFormFieldsProps {
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
  ownerObservationsReadOnly?: string | null;
  trainerObservations: string;
  onTrainerObservationsChange: (v: string) => void;
  nextObjectives: string;
  onNextObjectivesChange: (v: string) => void;

  isEditMode?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionFormFields({
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
  trainerObservations,
  onTrainerObservationsChange,
  nextObjectives,
  onNextObjectivesChange,
  isEditMode = false,
}: SessionFormFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Clients + Chiens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={cn('flex flex-col gap-1.5', selectedUserIds.length === 0 && 'sm:col-span-2')}
        >
          <Label>Clients</Label>
          <MultiSelect
            options={userOptions}
            selected={selectedUserIds}
            onChange={onUsersChange}
            placeholder="Sélectionner des clients"
            searchPlaceholder="Rechercher un client..."
            hasError={!!userFieldError}
            onSearchChange={onUsersSearchChange}
            isLoading={usersLoading}
            hasMore={hasNextPage}
            onLoadMore={onFetchNextPage}
            onOpenChange={onUsersOpenChange}
          />
          {userFieldError && <FieldError id="userIds-error" message={userFieldError} />}
        </div>

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
      </div>

      {/* Date + Durée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Date</Label>
          <Popover open={dateOpen} onOpenChange={onDateOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-invalid={!!dateFieldError}
                aria-describedby={dateFieldError ? 'date-error' : undefined}
                className={cn(
                  'justify-start text-left font-normal bg-transparent shadow-sm',
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
            <SelectValue placeholder="Sélectionner un type">
              {exerciseType && EXERCISE_TYPE_LABELS[exerciseType as ExerciseType] && (
                <Badge variant={EXERCISE_TYPE_LABELS[exerciseType as ExerciseType].variant}>
                  {EXERCISE_TYPE_LABELS[exerciseType as ExerciseType].label}
                </Badge>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXERCISE_TYPE_LABELS).map(([value, data]) => (
              <SelectItem key={value} value={value}>
                <Badge variant={data.variant}>{data.label}</Badge>
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

      {/* Observations */}
      <div className={cn('flex flex-col', isEditMode ? 'gap-3' : 'gap-1.5')}>
        <h3 className="text-sm font-medium">Observations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isEditMode && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ownerObservations">Client</Label>
              <Textarea
                id="ownerObservations"
                value={ownerObservationsReadOnly ?? ''}
                readOnly
                disabled
                placeholder="Aucune observation"
                className="resize-none text-muted-foreground"
              />
            </div>
          )}

          <div className={cn('flex flex-col gap-1.5', !isEditMode && 'sm:col-span-2')}>
            {isEditMode && <Label htmlFor="trainerObservations">Cool-K9</Label>}
            <Textarea
              id="trainerObservations"
              placeholder="Observations Cool-K9..."
              value={trainerObservations}
              onChange={e => onTrainerObservationsChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Objectifs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="previousObjectives">Séance</Label>
            <Textarea
              id="previousObjectives"
              placeholder="Objectifs de la séance..."
              value={previousObjectives}
              onChange={e => onPreviousObjectivesChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nextObjectives">Prochaine séance</Label>
            <Textarea
              id="nextObjectives"
              placeholder="Objectifs de la prochaine séance..."
              value={nextObjectives}
              onChange={e => onNextObjectivesChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
