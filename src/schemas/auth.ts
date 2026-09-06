import { z } from 'zod';

/** Numéro ivoirien au format international : +225 suivi de 10 chiffres. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .pipe(z.string().regex(/^\+225\d{10}$/, 'Numéro invalide (format attendu : +225XXXXXXXXXX)'));

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Code à 6 chiffres attendu'),
  next: z.string().startsWith('/').optional(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
