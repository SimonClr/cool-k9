import { z } from 'zod';

const dogRowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom est obligatoire').max(50),
  birthDate: z.string().min(1, 'La date de naissance est obligatoire'),
});

export const dogsSchema = z.object({ dogs: z.array(dogRowSchema) });

export type DogsFormValues = z.infer<typeof dogsSchema>;
export type DogRowValues = z.infer<typeof dogRowSchema>;
