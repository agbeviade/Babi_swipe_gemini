import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

export const ROLES = [
  'visitor',
  'user',
  'owner',
  'agent',
  'agency_admin',
  'moderator',
  'admin',
] as const;

export type Role = (typeof ROLES)[number];

export interface SessionUser {
  id: string;
  phone: string | null;
  email: string | null;
  role: Role;
  displayName: string | null;
}

/**
 * Single source of truth for identity on the server. The role always comes
 * from the database, never from the client or from user-editable metadata.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .maybeSingle<{ role: Role; display_name: string | null }>();

  return {
    id: user.id,
    phone: user.phone ?? null,
    email: user.email ?? null,
    role: profile?.role ?? 'user',
    displayName: profile?.display_name ?? null,
  };
}

export function isStaff(role: Role | undefined): boolean {
  return role === 'admin' || role === 'moderator';
}

export function isAdvertiser(role: Role | undefined): boolean {
  return role === 'owner' || role === 'agent' || role === 'agency_admin';
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function requireRole(allowed: readonly Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}
