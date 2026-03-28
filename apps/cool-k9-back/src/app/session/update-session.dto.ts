import { Environment, ExerciseType, ObservationStatus, Weather } from '@models';

export class UpdateSessionDto {
  date?: string;
  userIds?: string[];
  dogIds?: string[];
  exerciseType?: ExerciseType;
  duration?: number;
  location?: string | null;
  locationLat?: number | null;
  locationLon?: number | null;
  environment?: Environment | null;
  weather?: Weather | null;
  route?: string | null;
  previousObjectives?: string | null;
  nextObjectives?: string | null;
  ownerObservations?: string | null;
  trainerObservations?: string | null;
  observationStatus?: ObservationStatus | null;
}
