import { z } from 'zod';
import { Environment, ExerciseType, Weather } from '@models';

export const sessionSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Veuillez sélectionner au moins un client'),
  dogIds: z.array(z.string()).optional(),
  date: z.date({ required_error: 'La date est obligatoire' }),
  duration: z.coerce
    .number({ invalid_type_error: 'La durée est obligatoire' })
    .min(1, 'La durée doit être supérieure à 0'),
  exerciseType: z.nativeEnum(ExerciseType, { required_error: 'Le type de séance est obligatoire' }),
  environment: z.nativeEnum(Environment).optional(),
  weather: z.nativeEnum(Weather).optional(),
  locationDisplay: z.string().optional(),
  locationLat: z.number().nullable().optional(),
  locationLon: z.number().nullable().optional(),
  route: z.string().optional(),
  previousObjectives: z.string().optional(),
  trainerObservations: z.string().optional(),
  nextObjectives: z.string().optional(),
});

export type SessionFormValues = z.infer<typeof sessionSchema>;
