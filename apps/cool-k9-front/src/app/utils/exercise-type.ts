import { ExerciseType } from '@models';

export interface ExerciseTypeData {
  label: string;
  color: string;
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, ExerciseTypeData> = {
  [ExerciseType.HUNTING_GAMES]: {
    label: 'Hunting Games',
    color: 'warning',
  },
  [ExerciseType.NOSEWORK]: {
    label: 'Nosework',
    color: 'primary',
  },
  [ExerciseType.PISTAGE]: {
    label: 'Pistage',
    color: 'success',
  },
  [ExerciseType.MANTRAILING]: {
    label: 'Mantrailing',
    color: 'accent',
  },
};

export function getExerciseTypeData(type: ExerciseType): ExerciseTypeData {
  return EXERCISE_TYPE_LABELS[type];
}
