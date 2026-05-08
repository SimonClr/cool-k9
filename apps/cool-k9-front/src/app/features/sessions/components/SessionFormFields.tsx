import { Control, Controller, FieldErrors, UseFormRegister, useWatch } from 'react-hook-form';
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
import { CalendarIcon, Info, MapPin, MessageSquare, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/utils/cn.utils';
import { LocationAutocomplete } from './LocationAutocomplete';
import { type LocationValue } from '../models/location.model';
import { ENVIRONMENT_LABELS, WEATHER_LABELS } from '../constants/session.constants';
import { EXERCISE_TYPE_LABELS } from '../constants/exercise-type.constants';
import { SectionCard } from './SectionCard';
import { FieldError } from '@/components/ui/field-error';
import { type SessionFormValues } from '../models/session.schema';

export interface SessionFormFieldsProps {
  control: Control<SessionFormValues>;
  register: UseFormRegister<SessionFormValues>;
  errors: FieldErrors<SessionFormValues>;

  // Date popover — UI state managed by parent
  dateOpen: boolean;
  onDateOpenChange: (open: boolean) => void;

  // Location — coords handled by parent via setValue
  onLocationChange: (coords: LocationValue | null, displayName: string) => void;

  // User search — from useUserAndDogOptions
  userOptions: MultiSelectOption[];
  usersLoading: boolean;
  hasNextPage: boolean | undefined;
  onFetchNextPage: () => void;
  onUsersSearchChange: (s: string) => void;
  onUsersOpenChange: (open: boolean) => void;

  // Dog options — from useUserAndDogOptions
  dogOptions: MultiSelectOption[];
  dogsLoading: boolean;

  // Edit-mode specific
  infoHeaderAction?: React.ReactNode;
  ownerObservationsReadOnly?: string | null;
  isEditMode?: boolean;
}

export function SessionFormFields({
  control,
  register,
  errors,
  dateOpen,
  onDateOpenChange,
  onLocationChange,
  userOptions,
  usersLoading,
  hasNextPage,
  onFetchNextPage,
  onUsersSearchChange,
  onUsersOpenChange,
  dogOptions,
  dogsLoading,
  infoHeaderAction,
  ownerObservationsReadOnly,
  isEditMode = false,
}: SessionFormFieldsProps) {
  const selectedUserIds = useWatch({ control, name: 'userIds', defaultValue: [] });
  const locationDisplay = useWatch({ control, name: 'locationDisplay', defaultValue: '' });
  const environment = useWatch({ control, name: 'environment' });


  return (
    <div className="flex flex-col gap-2">
      {/* Section: Informations générales */}
      <SectionCard
        icon={<Info className="h-4 w-4" aria-hidden="true" />}
        title="Informations générales"
        headerAction={infoHeaderAction}
      >
        <div className="flex flex-col gap-4">

        {/* Clients + Chiens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={cn('flex flex-col gap-1.5', selectedUserIds.length === 0 && 'sm:col-span-2')}>
            <Label>Clients</Label>
            <Controller
              control={control}
              name="userIds"
              render={({ field }) => (
                <MultiSelect
                  options={userOptions}
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Sélectionner des clients"
                  searchPlaceholder="Rechercher un client..."
                  hasError={!!errors.userIds}
                  onSearchChange={onUsersSearchChange}
                  isLoading={usersLoading}
                  hasMore={hasNextPage}
                  onLoadMore={onFetchNextPage}
                  onOpenChange={onUsersOpenChange}
                />
              )}
            />
            {errors.userIds && <FieldError id="userIds-error" message={errors.userIds.message!} />}
          </div>

          {selectedUserIds.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Chiens</Label>
              <Controller
                control={control}
                name="dogIds"
                render={({ field }) => (
                  <MultiSelect
                    options={dogOptions}
                    selected={field.value ?? []}
                    onChange={field.onChange}
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
                )}
              />
            </div>
          )}
        </div>

        {/* Date + Durée */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Date</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Popover open={dateOpen} onOpenChange={onDateOpenChange}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-invalid={!!errors.date}
                      aria-describedby={errors.date ? 'date-error' : undefined}
                      className={cn(
                        'justify-start text-left font-normal bg-transparent shadow-sm',
                        !field.value && 'text-muted-foreground',
                        errors.date && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {field.value ? format(field.value, 'PPP', { locale: fr }) : 'Choisir une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={d => { if (d) { field.onChange(d); onDateOpenChange(false); } }}
                      locale={fr}
                      classNames={{ root: 'w-full' }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && <FieldError id="date-error" message={errors.date.message!} />}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duration">Durée (min)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              placeholder="60"
              {...register('duration')}
              aria-invalid={!!errors.duration}
              aria-describedby={errors.duration ? 'duration-error' : undefined}
              className={errors.duration ? 'border-destructive' : ''}
            />
            {errors.duration && <FieldError id="duration-error" message={errors.duration.message!} />}
          </div>
        </div>

        {/* Type de séance */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exerciseType">Type de séance</Label>
          <Controller
            control={control}
            name="exerciseType"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger
                  id="exerciseType"
                  aria-invalid={!!errors.exerciseType}
                  aria-describedby={errors.exerciseType ? 'exerciseType-error' : undefined}
                  className={cn(errors.exerciseType && 'border-destructive')}
                >
                  <SelectValue placeholder="Sélectionner un type">
                    {field.value && EXERCISE_TYPE_LABELS[field.value as ExerciseType] && (
                      <Badge variant={EXERCISE_TYPE_LABELS[field.value as ExerciseType].variant}>
                        {EXERCISE_TYPE_LABELS[field.value as ExerciseType].label}
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
            )}
          />
          {errors.exerciseType && (
            <FieldError id="exerciseType-error" message={errors.exerciseType.message!} />
          )}
        </div>

        {/* Lieu */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Lieu</Label>
          <LocationAutocomplete
            id="location"
            value={locationDisplay ?? ''}
            onChange={onLocationChange}
            placeholder="Parc de la Tête d'Or, Lyon"
          />
        </div>

        {/* Environnement + Météo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="environment">Environnement</Label>
            <Controller
              control={control}
              name="environment"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
              )}
            />
          </div>
          {environment === Environment.OUTDOOR && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weather">Météo</Label>
              <Controller
                control={control}
                name="weather"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
                )}
              />
            </div>
          )}
        </div>
        </div>
      </SectionCard>

      {/* Section: Parcours */}
      {environment === Environment.OUTDOOR && (
        <SectionCard icon={<MapPin className="h-4 w-4" aria-hidden="true" />} title="Parcours">
          <Textarea
            id="route"
            placeholder="Description du parcours..."
            {...register('route')}
          />
        </SectionCard>
      )}

      {/* Section: Observations */}
      <SectionCard icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />} title="Observations">
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
              {...register('trainerObservations')}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section: Objectifs */}
      <SectionCard icon={<Target className="h-4 w-4" aria-hidden="true" />} title="Objectifs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="previousObjectives">Séance</Label>
            <Textarea
              id="previousObjectives"
              placeholder="Objectifs de la séance..."
              {...register('previousObjectives')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nextObjectives">Prochaine séance</Label>
            <Textarea
              id="nextObjectives"
              placeholder="Objectifs de la prochaine séance..."
              {...register('nextObjectives')}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}