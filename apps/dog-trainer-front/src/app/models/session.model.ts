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
  duration: number; // in minutes
  userId: string;
  notes?: string;
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  [ExerciseType.OBEDIENCE]: 'Obéissance',
  [ExerciseType.AGILITY]: 'Agilité',
  [ExerciseType.SOCIALIZATION]: 'Socialisation',
  [ExerciseType.TRICKS]: 'Tricks',
  [ExerciseType.RECALL]: 'Rappel',
  [ExerciseType.LEASH_TRAINING]: 'Marche en laisse',
};
