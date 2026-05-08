import { Environment, Weather } from '@models';

export const WEATHER_LABELS: Record<Weather, string> = {
  [Weather.SUNNY]: 'Soleil ☀️',
  [Weather.CLOUDY]: 'Nuageux ☁️',
  [Weather.RAIN]: 'Pluie 🌧️',
  [Weather.WIND]: 'Vent 💨',
  [Weather.SNOW]: 'Neige ❄️',
  [Weather.STORM]: 'Orage ⛈️',
};

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  [Environment.INDOOR]: 'Intérieur',
  [Environment.OUTDOOR]: 'Extérieur',
};

export const OBSERVATION_STATUS_LABELS: Record<string, string> = {
  WAITING_OWNER: 'En attente client',
  WAITING_TRAINER: 'En attente Cool-K9',
  COMPLETE: 'Complète',
};

export const OBSERVATION_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'warning' | 'success'> = {
  WAITING_OWNER: 'warning',
  WAITING_TRAINER: 'secondary',
  COMPLETE: 'success',
};
