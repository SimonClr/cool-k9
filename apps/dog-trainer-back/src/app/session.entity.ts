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
