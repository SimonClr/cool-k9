export enum ExerciseType {
  EDUCATION = 'EDUCATION',
  RECHERCHE_MATIERE = 'RECHERCHE_MATIERE',
  RECHERCHE_PERSONNE = 'RECHERCHE_PERSONNE',
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
  dogIds: string[];
  dogNames: string[];
  exerciseType: ExerciseType;
  duration: number; // in minutes
  userIds: string[];
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
