'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requestOtpSchema, verifyOtpSchema } from '@/schemas/auth';
import { rateLimit } from '@/lib/rate-limit';
import { isSupabaseConfigured } from '@/lib/env';

export interface AuthActionState {
  step: 'phone' | 'otp';
  phone?: string;
  error?: string;
  message?: string;
}

async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return `${scope}:${ip}`;
}

export async function requestOtpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = requestOtpSchema.safeParse({ phone: formData.get('phone') });
  if (!parsed.success) {
    return { step: 'phone', error: parsed.error.issues[0]?.message ?? 'Numéro invalide' };
  }

  if (!isSupabaseConfigured()) {
    return {
      step: 'phone',
      phone: parsed.data.phone,
      error: "L'authentification n'est pas encore configurée.",
    };
  }

  const limit = rateLimit(await clientKey(`otp-request:${parsed.data.phone}`), 3, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      step: 'phone',
      phone: parsed.data.phone,
      error: `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data.phone });
  if (error) {
    return { step: 'phone', phone: parsed.data.phone, error: "Envoi du code impossible." };
  }

  return {
    step: 'otp',
    phone: parsed.data.phone,
    message: `Code envoyé au ${parsed.data.phone}.`,
  };
}

export async function verifyOtpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = verifyOtpSchema.safeParse({
    phone: formData.get('phone'),
    token: formData.get('token'),
    next: formData.get('next') || undefined,
  });
  if (!parsed.success) {
    return {
      step: 'otp',
      phone: String(formData.get('phone') ?? ''),
      error: parsed.error.issues[0]?.message ?? 'Code invalide',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      step: 'otp',
      phone: parsed.data.phone,
      error: "L'authentification n'est pas encore configurée.",
    };
  }

  const limit = rateLimit(await clientKey(`otp-verify:${parsed.data.phone}`), 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      step: 'otp',
      phone: parsed.data.phone,
      error: `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.token,
    type: 'sms',
  });
  if (error) {
    return { step: 'otp', phone: parsed.data.phone, error: 'Code incorrect ou expiré.' };
  }

  redirect(parsed.data.next ?? '/');
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect('/');
}
