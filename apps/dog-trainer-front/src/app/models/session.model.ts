export enum ExerciseType {
  OBEDIENCE = 'obedience',
  AGILITY = 'agility',
  SOCIALIZATION = 'socialization',
  TRICKS = 'tricks',
  RECALL = 'recall',
  LEASH_TRAINING = 'leash_training',
}

export interface Session {
  id: string;
  date: Date;
  dogName: string;
  exerciseType: ExerciseType;
  duration: number;
  userId: string;
  notes?: string;
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, ExerciseTypeData> = {
  [ExerciseType.OBEDIENCE]: {
    label: 'Obéissance',
    color: 'primary',
  },
  [ExerciseType.AGILITY]: {
    label: 'Agilité',
    color: 'accent',
  },
  [ExerciseType.SOCIALIZATION]: {
    label: 'Socialisation',
    color: 'success',
  },
  [ExerciseType.TRICKS]: {
    label: 'Tricks',
    color: 'warning',
  },
  [ExerciseType.RECALL]: {
    label: 'Rappel',
    color: 'neutral',
  },
  [ExerciseType.LEASH_TRAINING]: {
    label: 'Marche en laisse',
    color: 'info',
  },
};

export type ExerciseTypeData = {
  label: string;
  color: string;
};
