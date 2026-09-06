'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabasePublicEnv } from '@/lib/env';

let client: SupabaseClient | null = null;

/**
 * Anon-key client, subject to RLS. Only for auth flows and realtime reads.
 * Any sensitive read or write goes through a Server Action or Route Handler.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  if (!client) {
    const { url, anonKey } = requireSupabasePublicEnv();
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
