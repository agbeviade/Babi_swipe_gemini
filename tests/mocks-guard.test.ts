import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertMocksAllowed, mocksAllowed } from '@/mocks/guard';

function setEnv(nodeEnv: string, publicEnv?: string) {
  vi.stubEnv('NODE_ENV', nodeEnv);
  vi.stubEnv('NEXT_PUBLIC_ENV', publicEnv ?? '');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('garde-fou des données de démonstration', () => {
  it('autorise les mocks uniquement en développement', () => {
    setEnv('development');
    expect(mocksAllowed()).toBe(true);
  });

  it('les refuse en production', () => {
    setEnv('production');
    expect(mocksAllowed()).toBe(false);
    expect(() => assertMocksAllowed('test')).toThrow(/Refusing to load mock module/);
  });

  it('les refuse si NEXT_PUBLIC_ENV vaut production', () => {
    setEnv('development', 'production');
    expect(mocksAllowed()).toBe(false);
  });
});
