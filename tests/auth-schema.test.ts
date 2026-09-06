import { describe, expect, it } from 'vitest';
import { requestOtpSchema, verifyOtpSchema } from '@/schemas/auth';

describe('requestOtpSchema', () => {
  it('normalise les séparateurs et accepte un numéro ivoirien', () => {
    expect(requestOtpSchema.parse({ phone: '+225 07 01 02 03 04' }).phone).toBe('+2250701020304');
  });

  it('rejette un numéro sans indicatif ou de mauvaise longueur', () => {
    expect(requestOtpSchema.safeParse({ phone: '0701020304' }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ phone: '+225070102030' }).success).toBe(false);
  });
});

describe('verifyOtpSchema', () => {
  it('exige un code à 6 chiffres', () => {
    expect(
      verifyOtpSchema.safeParse({ phone: '+2250701020304', token: '12345' }).success,
    ).toBe(false);
    expect(
      verifyOtpSchema.safeParse({ phone: '+2250701020304', token: '123456' }).success,
    ).toBe(true);
  });

  it("refuse une redirection hors du site (open redirect)", () => {
    expect(
      verifyOtpSchema.safeParse({
        phone: '+2250701020304',
        token: '123456',
        next: 'https://evil.example/phish',
      }).success,
    ).toBe(false);
  });
});
