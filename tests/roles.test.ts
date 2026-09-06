// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { isAdvertiser, isStaff, ROLES, type Role } from '@/lib/auth/session';

describe('habilitations serveur', () => {
  it('réserve le staff aux rôles admin et moderator', () => {
    expect(isStaff('admin')).toBe(true);
    expect(isStaff('moderator')).toBe(true);
    for (const role of ROLES.filter((r) => r !== 'admin' && r !== 'moderator')) {
      expect(isStaff(role)).toBe(false);
    }
    expect(isStaff(undefined)).toBe(false);
  });

  it('identifie les annonceurs', () => {
    expect(isAdvertiser('owner')).toBe(true);
    expect(isAdvertiser('agent')).toBe(true);
    expect(isAdvertiser('agency_admin')).toBe(true);
    expect(isAdvertiser('user')).toBe(false);
  });

  it("n'accorde jamais le staff à un rôle inconnu", () => {
    expect(isStaff('superadmin' as Role)).toBe(false);
  });
});
