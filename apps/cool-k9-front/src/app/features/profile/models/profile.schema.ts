import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire').max(40),
  lastName: z.string().min(1, 'Le nom est obligatoire').max(30),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
