export enum ExerciseType {
  HUNTING_GAMES = 'HUNTING_GAMES',
  NOSEWORK = 'NOSEWORK',
  PISTAGE = 'PISTAGE',
  MANTRAILING = 'MANTRAILING',
}

export enum Environment {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
}

export enum Weather {
  SUNNY = 'SUNNY',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  WIND = 'WIND',
  SNOW = 'SNOW',
  STORM = 'STORM',
}

export enum ObservationStatus {
  WAITING_OWNER = 'WAITING_OWNER',
  WAITING_TRAINER = 'WAITING_TRAINER',
  COMPLETE = 'COMPLETE',
}

export interface Session {
  id: string;
  date: Date;
  dogId?: string;
  dogName: string;
  exerciseType: ExerciseType;
  duration: number; // in minutes
  userId: string;
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
