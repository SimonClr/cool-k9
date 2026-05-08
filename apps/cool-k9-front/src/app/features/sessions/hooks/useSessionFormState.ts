import { useState } from 'react';
import { Environment, ExerciseType, Session, Weather } from '@models';
import { type LocationValue } from '../models/location.model';
import { type FieldErrors } from '../models/session.model';

export function useSessionFormState(session?: Session) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(session?.userIds ?? []);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>(session?.dogIds ?? []);
  const [date, setDate] = useState<Date>(session ? new Date(session.date) : new Date());
  const [duration, setDuration] = useState(session ? String(session.duration) : '');
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>(session?.exerciseType ?? '');
  const [environment, setEnvironment] = useState<Environment | ''>(session?.environment ?? '');
  const [weather, setWeather] = useState<Weather | ''>(session?.weather ?? '');
  const [locationDisplay, setLocationDisplay] = useState(session?.location ?? '');
  const [locationCoords, setLocationCoords] = useState<LocationValue | null>(null);
  const [route, setRoute] = useState(session?.route ?? '');
  const [previousObjectives, setPreviousObjectives] = useState(session?.previousObjectives ?? '');
  const [trainerObservations, setTrainerObservations] = useState(session?.trainerObservations ?? '');
  const [nextObjectives, setNextObjectives] = useState(session?.nextObjectives ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const sort = (arr: string[]) => [...arr].sort().join(',');
  const isDirty = session
    ? sort(selectedUserIds) !== sort(session.userIds) ||
      sort(selectedDogIds) !== sort(session.dogIds) ||
      date.toISOString().slice(0, 10) !== new Date(session.date).toISOString().slice(0, 10) ||
      duration !== String(session.duration) ||
      exerciseType !== (session.exerciseType ?? '') ||
      environment !== (session.environment ?? '') ||
      weather !== (session.weather ?? '') ||
      locationDisplay.trim() !== (session.location ?? '') ||
      route.trim() !== (session.route ?? '') ||
      previousObjectives.trim() !== (session.previousObjectives ?? '') ||
      trainerObservations.trim() !== (session.trainerObservations ?? '') ||
      nextObjectives.trim() !== (session.nextObjectives ?? '')
    : true;

  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));

  return {
    // values
    selectedUserIds,
    selectedDogIds,
    date,
    duration,
    exerciseType,
    environment,
    weather,
    locationDisplay,
    locationCoords,
    route,
    previousObjectives,
    trainerObservations,
    nextObjectives,
    fieldErrors,
    isDirty,
    // actions
    onUsersChange: (ids: string[]) => {
      setSelectedUserIds(ids);
      clearFieldError('userIds');
    },
    onDogsChange: setSelectedDogIds,
    onDateSelect: (d: Date) => {
      setDate(d);
      clearFieldError('date');
    },
    onDurationChange: (v: string) => {
      setDuration(v);
      clearFieldError('duration');
    },
    onExerciseTypeChange: (v: string) => {
      setExerciseType(v as ExerciseType);
      clearFieldError('exerciseType');
    },
    onEnvironmentChange: (v: string) => {
      setEnvironment(v as Environment);
      if (v !== Environment.OUTDOOR) setWeather('');
    },
    onWeatherChange: (v: string) => setWeather(v as Weather),
    onLocationChange: (coords: LocationValue | null, display: string) => {
      setLocationDisplay(display);
      setLocationCoords(coords);
    },
    onRouteChange: setRoute,
    onPreviousObjectivesChange: setPreviousObjectives,
    onTrainerObservationsChange: setTrainerObservations,
    onNextObjectivesChange: setNextObjectives,
    setFieldErrors,
  };
}
