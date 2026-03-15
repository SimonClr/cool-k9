import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Environment, ExerciseType, Weather } from '@models';
import { useCreateSession } from '../../hooks/useSessions';
import { useDogs } from '../../hooks/useDogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationAutocomplete, LocationValue } from '../../components/LocationAutocomplete';

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  [ExerciseType.OBEDIENCE]: 'Obéissance',
  [ExerciseType.AGILITY]: 'Agilité',
  [ExerciseType.SOCIALIZATION]: 'Socialisation',
  [ExerciseType.TRICKS]: 'Tricks',
  [ExerciseType.RECALL]: 'Rappel',
  [ExerciseType.LEASH_TRAINING]: 'Marche en laisse',
};

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  [Environment.INDOOR]: 'Intérieur',
  [Environment.OUTDOOR]: 'Extérieur',
};

const WEATHER_LABELS: Record<Weather, string> = {
  [Weather.SUNNY]: '☀️ Soleil',
  [Weather.CLOUDY]: '☁️ Nuageux',
  [Weather.RAIN]: '🌧️ Pluie',
  [Weather.WIND]: '💨 Vent',
  [Weather.SNOW]: '❄️ Neige',
  [Weather.STORM]: '⛈️ Orage',
};

const today = new Date().toISOString().split('T')[0];

type FieldErrors = {
  dogId?: string;
  date?: string;
  duration?: string;
  exerciseType?: string;
};

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function AddSessionPage() {
  const navigate = useNavigate();
  const createSession = useCreateSession();
  const { data: dogs = [] } = useDogs();

  // Champs requis
  const [dogId, setDogId] = useState('');
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState('');
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>('');

  // Auto-sélection si un seul chien
  const effectiveDogId = dogId || (dogs.length === 1 ? dogs[0].id : '');

  // Champs optionnels
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [weather, setWeather] = useState<Weather | ''>('');
  const [location, setLocation] = useState<{ display: string; coords: LocationValue | null }>({ display: '', coords: null });
  const [ownerObservations, setOwnerObservations] = useState('');
  const [trainerObservations, setTrainerObservations] = useState('');
  const [nextObjectives, setNextObjectives] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!effectiveDogId) errors.dogId = 'Veuillez sélectionner un chien';
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
        date: new Date(date) as unknown as Date,
        dogId: effectiveDogId || undefined,
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
        ownerObservations: ownerObservations.trim() || undefined,
        trainerObservations: trainerObservations.trim() || undefined,
        nextObjectives: nextObjectives.trim() || undefined,
      },
      {
        onSuccess: () => navigate('/sessions', { replace: true }),
        onError: () =>
          setApiError('Erreur lors de la création de la séance. Veuillez réessayer.'),
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle séance</CardTitle>
          <CardDescription>
            Renseignez les informations de la séance d'entraînement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {apiError && (
              <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Chien */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dogId">Chien</Label>
              <Select
                value={effectiveDogId}
                onValueChange={value => {
                  setDogId(value);
                  if (fieldErrors.dogId) setFieldErrors(p => ({ ...p, dogId: undefined }));
                }}
              >
                <SelectTrigger
                  id="dogId"
                  aria-invalid={!!fieldErrors.dogId}
                  aria-describedby={fieldErrors.dogId ? 'dogId-error' : undefined}
                  className={cn(fieldErrors.dogId && 'border-destructive')}
                >
                  <SelectValue placeholder="Sélectionner un chien" />
                </SelectTrigger>
                <SelectContent>
                  {dogs.map(dog => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.dogId && <FieldError id="dogId-error" message={fieldErrors.dogId} />}
            </div>

            {/* Date + Durée */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => {
                    setDate(e.target.value);
                    if (fieldErrors.date) setFieldErrors(p => ({ ...p, date: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.date}
                  aria-describedby={fieldErrors.date ? 'date-error' : undefined}
                  className={fieldErrors.date ? 'border-destructive' : ''}
                />
                {fieldErrors.date && <FieldError id="date-error" message={fieldErrors.date} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="duration">Durée (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  placeholder="60"
                  value={duration}
                  onChange={e => {
                    setDuration(e.target.value);
                    if (fieldErrors.duration) setFieldErrors(p => ({ ...p, duration: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.duration}
                  aria-describedby={fieldErrors.duration ? 'duration-error' : undefined}
                  className={fieldErrors.duration ? 'border-destructive' : ''}
                />
                {fieldErrors.duration && (
                  <FieldError id="duration-error" message={fieldErrors.duration} />
                )}
              </div>
            </div>

            {/* Type de séance */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exerciseType">Type de séance</Label>
              <Select
                value={exerciseType}
                onValueChange={value => {
                  setExerciseType(value as ExerciseType);
                  if (fieldErrors.exerciseType)
                    setFieldErrors(p => ({ ...p, exerciseType: undefined }));
                }}
              >
                <SelectTrigger
                  id="exerciseType"
                  aria-invalid={!!fieldErrors.exerciseType}
                  aria-describedby={fieldErrors.exerciseType ? 'exerciseType-error' : undefined}
                  className={cn(fieldErrors.exerciseType && 'border-destructive')}
                >
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXERCISE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.exerciseType && (
                <FieldError id="exerciseType-error" message={fieldErrors.exerciseType} />
              )}
            </div>

            {/* Environnement + Météo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="environment">Environnement</Label>
                <Select
                  value={environment}
                  onValueChange={value => {
                    setEnvironment(value as Environment);
                    if (value !== Environment.OUTDOOR) setWeather('');
                  }}
                >
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
                  <Select
                    value={weather}
                    onValueChange={value => setWeather(value as Weather)}
                  >
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

            {/* Lieu */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Lieu</Label>
              <LocationAutocomplete
                id="location"
                value={location.display}
                onChange={(coords, displayName) =>
                  setLocation({ display: displayName, coords })
                }
                placeholder="Parc de la Tête d'Or, Lyon"
              />
            </div>

            {/* Observations propriétaire */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ownerObservations">Observations propriétaire</Label>
              <Textarea
                id="ownerObservations"
                placeholder="Observations du propriétaire après la séance..."
                value={ownerObservations}
                onChange={e => setOwnerObservations(e.target.value)}
              />
            </div>

            {/* Observations dresseur */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trainerObservations">Observations dresseur</Label>
              <Textarea
                id="trainerObservations"
                placeholder="Observations du dresseur..."
                value={trainerObservations}
                onChange={e => setTrainerObservations(e.target.value)}
              />
            </div>

            {/* Objectifs prochaine séance */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nextObjectives">Objectifs prochaine séance</Label>
              <Textarea
                id="nextObjectives"
                placeholder="Objectifs à atteindre lors de la prochaine séance..."
                value={nextObjectives}
                onChange={e => setNextObjectives(e.target.value)}
              />
            </div>

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
    </div>
  );
}
