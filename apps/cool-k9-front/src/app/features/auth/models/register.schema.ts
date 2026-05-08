import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire').max(40),
  lastName: z.string().min(1, 'Le nom est obligatoire').max(30),
  email: z.string().min(1, "L'email est obligatoire").email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
  confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
