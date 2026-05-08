import { Session } from '@models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Environment, ExerciseType, Weather } from '@models';
import { SessionFormFields } from './SessionFormFields';
import { OBSERVATION_STATUS_LABELS, OBSERVATION_STATUS_VARIANTS } from '../constants/session.constants';
import { useSessionForm, type SessionFormMode } from '../hooks/useSessionForm';

export function SessionForm({ mode, session }: { mode: SessionFormMode; session?: Session }) {
  const isEdit = mode === 'admin-edit';
  const {
    userOptions, usersLoading, hasNextPage, fetchNextPage, setUsersSearch, setUsersOpen,
    dogOptions, dogsLoading,
    selectedUserIds, setSelectedUserIds,
    selectedDogIds, setSelectedDogIds,
    date, setDate, dateOpen, setDateOpen,
    duration, setDuration,
    exerciseType, setExerciseType,
    environment, setEnvironment,
    weather, setWeather,
    location, setLocation,
    route, setRoute,
    previousObjectives, setPreviousObjectives,
    trainerObservations, setTrainerObservations,
    nextObjectives, setNextObjectives,
    fieldErrors, setFieldErrors,
    isDirty, isPending, handleSubmit,
  } = useSessionForm(mode, session);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SessionFormFields
        infoHeaderAction={
          isEdit && session?.observationStatus ? (
            <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
              {OBSERVATION_STATUS_LABELS[session.observationStatus]}
            </Badge>
          ) : undefined
        }
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
        ownerObservationsReadOnly={isEdit ? session?.ownerObservations : undefined}
        trainerObservations={trainerObservations}
        onTrainerObservationsChange={setTrainerObservations}
        nextObjectives={nextObjectives}
        onNextObjectivesChange={setNextObjectives}
        isEditMode={isEdit}
      />

      <Button
        type="submit"
        className="flex-1"
        disabled={isPending || (isEdit ? !isDirty : selectedUserIds.length === 0 || !duration || !exerciseType)}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {isEdit ? 'Enregistrement...' : 'Création...'}
          </>
        ) : (
          isEdit ? 'Enregistrer' : 'Créer la séance'
        )}
      </Button>
    </form>
  );
}
