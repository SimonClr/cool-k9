import { ExerciseType } from '@models';
import { ExerciseTypeData } from '../models/exercise.model';
import { EXERCISE_TYPE_LABELS } from '../constants/exercise-type.constants';

export function getExerciseTypeData(type: ExerciseType): ExerciseTypeData {
  return EXERCISE_TYPE_LABELS[type] ?? { label: type, variant: 'secondary' };
}
