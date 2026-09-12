'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  resendOtpSchema,
  signInSchema,
  signUpSchema,
  verifyEmailOtpSchema,
} from '@/schemas/auth';
import { rateLimit } from '@/lib/rate-limit';
import { isSupabaseConfigured } from '@/lib/env';

export type AuthStep = 'credentials' | 'otp';

export interface AuthActionState {
  step: AuthStep;
  mode: 'signin' | 'signup';
  email?: string;
  error?: string;
  message?: string;
}

const NOT_CONFIGURED = "L'authentification n'est pas encore configurée.";

async function clientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

async function appOrigin(): Promise<string> {
  const headerList = await headers();
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  const proto = headerList.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

function otpCallbackUrl(origin: string, next?: string): string {
  const url = new URL('/auth/callback', origin);
  if (next) url.searchParams.set('next', next);
  return url.toString();
}

/** L'email de vérification part par le SMTP configuré dans Supabase (Resend). */
async function sendEmailOtp(email: string, next: string | undefined, shouldCreateUser: boolean) {
  const supabase = await createSupabaseServerClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo: otpCallbackUrl(await appOrigin(), next),
    },
  });
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') || undefined,
  });
  if (!parsed.success) {
    return {
      step: 'credentials',
      mode: 'signin',
      email: String(formData.get('email') ?? ''),
      error: parsed.error.issues[0]?.message ?? 'Identifiants invalides',
    };
  }

  const { email, password, next } = parsed.data;

  if (!isSupabaseConfigured()) {
    return { step: 'credentials', mode: 'signin', email, error: NOT_CONFIGURED };
  }

  const limit = rateLimit(`signin:${await clientIp()}:${email}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      step: 'credentials',
      mode: 'signin',
      email,
      error: `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Compte créé mais e-mail jamais confirmé : on renvoie un code au lieu d'un mur.
    if (error.code === 'email_not_confirmed') {
      await sendEmailOtp(email, next, false);
      return {
        step: 'otp',
        mode: 'signin',
        email,
        message: `Adresse non vérifiée : un code à 6 chiffres vient d'être envoyé à ${email}.`,
      };
    }
    return {
      step: 'credentials',
      mode: 'signin',
      email,
      error: 'E-mail ou mot de passe incorrect.',
    };
  }

  redirect(next ?? '/');
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName') || undefined,
    next: formData.get('next') || undefined,
  });
  if (!parsed.success) {
    return {
      step: 'credentials',
      mode: 'signup',
      email: String(formData.get('email') ?? ''),
      error: parsed.error.issues[0]?.message ?? 'Informations invalides',
    };
  }

  const { email, password, displayName, next } = parsed.data;

  if (!isSupabaseConfigured()) {
    return { step: 'credentials', mode: 'signup', email, error: NOT_CONFIGURED };
  }

  const limit = rateLimit(`signup:${await clientIp()}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return {
      step: 'credentials',
      mode: 'signup',
      email,
      error: `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: otpCallbackUrl(await appOrigin(), next),
    },
  });

  if (error) {
    return {
      step: 'credentials',
      mode: 'signup',
      email,
      error:
        error.code === 'user_already_exists'
          ? 'Un compte existe déjà avec cette adresse.'
          : "Création du compte impossible pour le moment.",
    };
  }

  return {
    step: 'otp',
    mode: 'signup',
    email,
    message: `Code à 6 chiffres envoyé à ${email}.`,
  };
}

export async function verifyEmailOtpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = formData.get('mode') === 'signup' ? 'signup' : 'signin';
  const parsed = verifyEmailOtpSchema.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
    next: formData.get('next') || undefined,
  });
  if (!parsed.success) {
    return {
      step: 'otp',
      mode,
      email: String(formData.get('email') ?? ''),
      error: parsed.error.issues[0]?.message ?? 'Code invalide',
    };
  }

  const { email, token, next } = parsed.data;

  if (!isSupabaseConfigured()) {
    return { step: 'otp', mode, email, error: NOT_CONFIGURED };
  }

  const limit = rateLimit(`otp-verify:${await clientIp()}:${email}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      step: 'otp',
      mode,
      email,
      error: `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  // `signup` pour une première confirmation, `email` pour une connexion par code.
  let { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) {
    ({ error } = await supabase.auth.verifyOtp({ email, token, type: 'email' }));
  }

  if (error) {
    return { step: 'otp', mode, email, error: 'Code incorrect ou expiré.' };
  }

  redirect(next ?? '/');
}

export async function resendEmailOtpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = formData.get('mode') === 'signup' ? 'signup' : 'signin';
  const parsed = resendOtpSchema.safeParse({
    email: formData.get('email'),
    next: formData.get('next') || undefined,
  });
  if (!parsed.success) {
    return {
      step: 'otp',
      mode,
      email: String(formData.get('email') ?? ''),
      error: parsed.error.issues[0]?.message ?? 'Adresse invalide',
    };
  }

  const { email, next } = parsed.data;

  if (!isSupabaseConfigured()) {
    return { step: 'otp', mode, email, error: NOT_CONFIGURED };
  }

  const limit = rateLimit(`otp-resend:${await clientIp()}:${email}`, 3, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      step: 'otp',
      mode,
      email,
      error: `Trop de demandes. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    };
  }

  await sendEmailOtp(email, next, false);

  // Réponse identique que l'adresse existe ou non : pas d'énumération de comptes.
  return { step: 'otp', mode, email, message: `Nouveau code envoyé à ${email}.` };
}

export async function signInWithGoogleAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect('/connexion?error=config');
  }

  const nextValue = formData.get('next');
  const next = typeof nextValue === 'string' && nextValue.startsWith('/') && !nextValue.startsWith('//')
    ? nextValue
    : undefined;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: otpCallbackUrl(await appOrigin(), next),
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error || !data.url) {
    redirect('/connexion?error=google');
  }

  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect('/');
}
