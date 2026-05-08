import { useEffect, useState } from 'react';
import { Session } from '@models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SessionFormFields } from './SessionFormFields';
import { OBSERVATION_STATUS_LABELS, OBSERVATION_STATUS_VARIANTS } from '../constants/session.constants';
import { type SessionFormMode } from '../models/session.model';
import { useSessionFormState } from '../hooks/useSessionFormState';
import { useUserAndDogOptions } from '../hooks/useUserAndDogOptions';
import { useSessionSubmit } from '../hooks/useSessionSubmit';

export function SessionForm({ mode, session }: { mode: SessionFormMode; session?: Session }) {
  const isEdit = mode === 'admin-edit';
  const state = useSessionFormState(session);
  const options = useUserAndDogOptions(state.selectedUserIds, isEdit, session);
  const submit = useSessionSubmit(mode, state, session?.id);
  const [dateOpen, setDateOpen] = useState(false);

  // Apply auto-selected dogs (create mode: user has exactly one dog)
  useEffect(() => {
    if (options.autoSelectedDogIds.length === 0) return;
    const toAdd = options.autoSelectedDogIds.filter(id => !state.selectedDogIds.includes(id));
    const toRemove = state.selectedDogIds.filter(
      id => !options.availableDogs.some((d: { id: string }) => d.id === id)
    );
    if (toAdd.length > 0 || toRemove.length > 0) {
      const next = [
        ...state.selectedDogIds.filter(id => !toRemove.includes(id)),
        ...toAdd,
      ];
      state.onDogsChange(next);
    }
  }, [options.autoSelectedDogIds, options.availableDogs]);

  return (
    <form onSubmit={submit.handleSubmit} className="flex flex-col gap-4">
      <SessionFormFields
        infoHeaderAction={
          isEdit && session?.observationStatus ? (
            <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
              {OBSERVATION_STATUS_LABELS[session.observationStatus]}
            </Badge>
          ) : undefined
        }
        userOptions={options.userOptions}
        selectedUserIds={state.selectedUserIds}
        onUsersChange={state.onUsersChange}
        usersLoading={options.usersLoading}
        hasNextPage={options.hasNextPage}
        onFetchNextPage={options.onFetchNextPage}
        onUsersSearchChange={options.onUsersSearchChange}
        onUsersOpenChange={options.onUsersOpenChange}
        userFieldError={state.fieldErrors.userIds}
        dogOptions={options.dogOptions}
        selectedDogIds={state.selectedDogIds}
        onDogsChange={state.onDogsChange}
        dogsLoading={options.dogsLoading}
        date={state.date}
        dateOpen={dateOpen}
        onDateOpenChange={setDateOpen}
        onDateSelect={d => {
          if (d) { state.onDateSelect(d); setDateOpen(false); }
        }}
        dateFieldError={state.fieldErrors.date}
        duration={state.duration}
        onDurationChange={state.onDurationChange}
        durationFieldError={state.fieldErrors.duration}
        exerciseType={state.exerciseType}
        onExerciseTypeChange={state.onExerciseTypeChange}
        exerciseTypeFieldError={state.fieldErrors.exerciseType}
        environment={state.environment}
        onEnvironmentChange={state.onEnvironmentChange}
        weather={state.weather}
        onWeatherChange={state.onWeatherChange}
        locationDisplay={state.locationDisplay}
        onLocationChange={state.onLocationChange}
        route={state.route}
        onRouteChange={state.onRouteChange}
        previousObjectives={state.previousObjectives}
        onPreviousObjectivesChange={state.onPreviousObjectivesChange}
        ownerObservationsReadOnly={isEdit ? session?.ownerObservations : undefined}
        trainerObservations={state.trainerObservations}
        onTrainerObservationsChange={state.onTrainerObservationsChange}
        nextObjectives={state.nextObjectives}
        onNextObjectivesChange={state.onNextObjectivesChange}
        isEditMode={isEdit}
      />

      <Button
        type="submit"
        className="flex-1"
        disabled={
          submit.isPending ||
          (isEdit
            ? !state.isDirty
            : state.selectedUserIds.length === 0 || !state.duration || !state.exerciseType)
        }
        aria-busy={submit.isPending}
      >
        {submit.isPending ? (
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
