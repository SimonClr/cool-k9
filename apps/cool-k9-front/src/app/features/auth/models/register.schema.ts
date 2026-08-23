import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire').max(40),
  lastName: z.string().min(1, 'Le nom est obligatoire').max(30),
  email: z.string().min(1, "L'email est obligatoire").email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
  confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  // boolean().refine() rather than literal(true): the field is genuinely a
  // boolean the user can uncheck, and only its accepted value is constrained.
  // literal(true) would type the field as `true`, which no default value can
  // satisfy.
  acceptedTerms: z.boolean().refine(v => v, {
    message: 'Vous devez accepter les conditions générales et la politique de confidentialité',
  }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
