export enum ExerciseType {
  OBEDIENCE = 'OBEDIENCE',
  AGILITY = 'AGILITY',
  SOCIALIZATION = 'SOCIALIZATION',
  TRICKS = 'TRICKS',
  RECALL = 'RECALL',
  LEASH_TRAINING = 'LEASH_TRAINING',
}

export interface Session {
  id: string;
  date: Date;
  dogId?: string;
  dogName: string;
  exerciseType: ExerciseType;
  duration: number; // in minutes
  userId: string;
  notes?: string;
}
