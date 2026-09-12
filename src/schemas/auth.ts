import { z } from 'zod';

/** Redirection interne uniquement : `//evil.example` est une URL protocole-relative. */
export const nextPathSchema = z
  .string()
  .startsWith('/')
  .refine((value) => !value.startsWith('//'), 'Redirection externe refusée')
  .optional();

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().email('Adresse e-mail invalide'));

/** Supabase tronque les mots de passe au-delà de 72 octets (bcrypt). */
export const passwordSchema = z
  .string()
  .min(8, 'Mot de passe : 8 caractères minimum')
  .max(72, 'Mot de passe : 72 caractères maximum');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  next: nextPathSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(2, 'Nom trop court').max(80).optional(),
  next: nextPathSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: emailSchema,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Code à 6 chiffres attendu'),
  next: nextPathSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
  next: nextPathSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifyEmailOtpInput = z.infer<typeof verifyEmailOtpSchema>;
