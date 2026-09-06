import { z } from 'zod';

/**
 * Environment contract.
 *
 * Public variables are inlined in the browser bundle: they must never contain
 * a secret. Server variables are read lazily so that importing this module
 * from a client component cannot leak them.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_ENV: z.enum(['development', 'preview', 'production']).default('development'),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  AI_PROVIDER_API_KEY: z.string().min(1).optional(),
  PAYMENT_PROVIDER_API_KEY: z.string().min(1).optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
});

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must never be called from the browser');
  }
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY,
    PAYMENT_PROVIDER_API_KEY: process.env.PAYMENT_PROVIDER_API_KEY,
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
  });
}

export function requireSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  return { url, anonKey };
}
