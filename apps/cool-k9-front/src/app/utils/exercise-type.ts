import { ExerciseType } from '@models';

export interface ExerciseTypeData {
  label: string;
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'info';
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, ExerciseTypeData> = {
  [ExerciseType.INITIATION]:         { label: 'Initiation',           variant: 'info'      },
  [ExerciseType.EDUCATION]:          { label: 'Éducation',            variant: 'default'   },
  [ExerciseType.RECHERCHE_MATIERE]:  { label: 'Recherche de matière', variant: 'warning'   },
  [ExerciseType.RECHERCHE_PERSONNE]: { label: 'Recherche de personne', variant: 'success'  },
};

export function getExerciseTypeData(type: ExerciseType): ExerciseTypeData {
  return EXERCISE_TYPE_LABELS[type] ?? { label: type, variant: 'secondary' };
}
