import { Environment, ExerciseType, ObservationStatus, Weather } from '@models';

export class CreateSessionDto {
  date: string;
  userIds: string[];
  dogIds?: string[];
  exerciseType: ExerciseType;
  duration: number;
  location?: string;
  locationLat?: number;
  locationLon?: number;
  environment?: Environment;
  weather?: Weather;
  route?: string;
  previousObjectives?: string;
  nextObjectives?: string;
  ownerObservations?: string;
  trainerObservations?: string;
  observationStatus?: ObservationStatus;
}
