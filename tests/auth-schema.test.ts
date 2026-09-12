import { describe, expect, it } from 'vitest';
import { signInSchema, signUpSchema, verifyEmailOtpSchema } from '@/schemas/auth';

describe('signInSchema', () => {
  it("normalise l'adresse e-mail", () => {
    expect(signInSchema.parse({ email: '  Test@Example.COM ', password: 'secret' }).email).toBe(
      'test@example.com',
    );
  });

  it('rejette une adresse invalide ou un mot de passe vide', () => {
    expect(signInSchema.safeParse({ email: 'pas-un-email', password: 'secret' }).success).toBe(
      false,
    );
    expect(signInSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('exige 8 caractères minimum', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: '1234567' }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: '12345678' }).success).toBe(true);
  });
});

describe('verifyEmailOtpSchema', () => {
  it('exige un code à 6 chiffres', () => {
    expect(verifyEmailOtpSchema.safeParse({ email: 'a@b.com', token: '12345' }).success).toBe(
      false,
    );
    expect(verifyEmailOtpSchema.safeParse({ email: 'a@b.com', token: '123456' }).success).toBe(
      true,
    );
  });

  it('refuse une redirection hors du site (open redirect)', () => {
    expect(
      verifyEmailOtpSchema.safeParse({
        email: 'a@b.com',
        token: '123456',
        next: 'https://evil.example/phish',
      }).success,
    ).toBe(false);
    expect(
      verifyEmailOtpSchema.safeParse({
        email: 'a@b.com',
        token: '123456',
        next: '//evil.example/phish',
      }).success,
    ).toBe(false);
  });
});
