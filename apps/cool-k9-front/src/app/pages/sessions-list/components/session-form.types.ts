export type FieldErrors = {
  userIds?: string;
  date?: string;
  duration?: string;
  exerciseType?: string;
};

export const OBSERVATION_STATUS_LABELS: Record<string, string> = {
  WAITING_OWNER: 'En attente propriétaire',
  WAITING_TRAINER: 'En attente dresseur',
  COMPLETE: 'Complète',
};

export const OBSERVATION_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'warning' | 'success'> = {
  WAITING_OWNER: 'warning',
  WAITING_TRAINER: 'secondary',
  COMPLETE: 'success',
};
