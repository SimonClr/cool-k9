import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Environment, ExerciseType, Weather } from '@models';
import { toast } from 'sonner';
import { useCreateSession, useUpdateSession } from './useSessions';
import { type useSessionFormState } from './useSessionFormState';
import { type SessionFormMode } from '../models/session.model';

type FormState = ReturnType<typeof useSessionFormState>;

export function useSessionSubmit(mode: SessionFormMode, state: FormState, sessionId?: string) {
  const navigate = useNavigate();
  const isEdit = mode === 'admin-edit';
  const createSession = useCreateSession();
  const updateSession = useUpdateSession(sessionId ?? '');

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (state.selectedUserIds.length === 0) errors.userIds = 'Veuillez sélectionner au moins un client';
    if (!state.date) errors.date = 'La date est obligatoire';
    if (!state.duration) {
      errors.duration = 'La durée est obligatoire';
    } else {
      const parsed = parseInt(state.duration, 10);
      if (isNaN(parsed) || parsed < 1) errors.duration = 'La durée doit être supérieure à 0';
    }
    if (!state.exerciseType) errors.exerciseType = 'Le type de séance est obligatoire';
    state.setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => ({
    date: state.date as unknown as Date,
    userIds: state.selectedUserIds,
    dogIds: state.selectedDogIds.length > 0 ? state.selectedDogIds : undefined,
    exerciseType: state.exerciseType as ExerciseType,
    duration: parseInt(state.duration, 10),
    environment: (state.environment || null) as Environment | null | undefined,
    weather: state.environment === Environment.OUTDOOR
      ? ((state.weather || null) as Weather | null | undefined)
      : null,
    location: state.locationDisplay.trim() || null,
    locationLat: state.locationCoords?.lat ?? null,
    locationLon: state.locationCoords?.lon ?? null,
    route: state.route.trim() || null,
    previousObjectives: state.previousObjectives.trim() || null,
    trainerObservations: state.trainerObservations.trim() || null,
    nextObjectives: state.nextObjectives.trim() || null,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEdit && !validate()) return;

    const payload = buildPayload();

    if (isEdit) {
      updateSession.mutate(payload as Parameters<typeof updateSession.mutate>[0], {
        onSuccess: () => {
          toast.success('Séance mise à jour avec succès !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la mise à jour. Veuillez réessayer.'),
      });
    } else {
      createSession.mutate(payload as Parameters<typeof createSession.mutate>[0], {
        onSuccess: () => {
          toast.success('Séance créée avec succès !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la création de la séance. Veuillez réessayer.'),
      });
    }
  };

  const isPending = isEdit ? updateSession.isPending : createSession.isPending;

  return { handleSubmit, isPending };
}
