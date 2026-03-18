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
