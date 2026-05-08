import { ExerciseType } from '@models';
import { ExerciseTypeData } from '../models/exercise.model';

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, ExerciseTypeData> = {
  [ExerciseType.INITIATION]: { label: 'Initiation', variant: 'success' },
  [ExerciseType.EDUCATION]: { label: 'Éducation', variant: 'info' },
  [ExerciseType.RECHERCHE_MATIERE]: { label: 'Recherche de matière', variant: 'warning' },
  [ExerciseType.RECHERCHE_PERSONNE]: { label: 'Recherche de personne', variant: 'error' },
};
