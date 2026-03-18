import { ExerciseType } from '@models';

export interface ExerciseTypeData {
  label: string;
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'info';
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, ExerciseTypeData> = {
  [ExerciseType.HUNTING_GAMES]: { label: 'Hunting Games', variant: 'warning' },
  [ExerciseType.NOSEWORK]:      { label: 'Nosework',      variant: 'default' },
  [ExerciseType.PISTAGE]:       { label: 'Pistage',       variant: 'success' },
  [ExerciseType.MANTRAILING]:   { label: 'Mantrailing',   variant: 'secondary' },
};

export function getExerciseTypeData(type: ExerciseType): ExerciseTypeData {
  return EXERCISE_TYPE_LABELS[type];
}
