import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv, requireSupabasePublicEnv } from '@/lib/env';

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client: bypasses RLS. Reserved for webhooks, ledger writes,
 * moderation and background jobs, after the caller has been authorized.
 * Never import this module from a client component.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for privileged operations');
  }
  if (!adminClient) {
    const { url } = requireSupabasePublicEnv();
    adminClient = createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
