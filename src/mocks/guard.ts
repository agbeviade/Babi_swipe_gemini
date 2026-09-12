/**
 * Garde-fou : les données de démonstration ne doivent jamais être servies
 * ailseurs qu'en développement local. En preview/production, la source de
 * vérité est Supabase (voir MIGRATION_PLAN.md, phase 2).
 */
export function mocksAllowed(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENV !== 'production';
}

export function assertMocksAllowed(moduleName: string): void {
  if (!mocksAllowed()) {
    throw new Error(
      `Refusing to load mock module "${moduleName}" outside development. ` +
        'Mock data must never be presented as real listings.',
    );
  }
}
