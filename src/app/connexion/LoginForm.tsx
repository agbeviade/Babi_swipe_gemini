'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import {
  resendEmailOtpAction,
  signInAction,
  signInWithGoogleAction,
  signUpAction,
  verifyEmailOtpAction,
  type AuthActionState,
} from './actions';

const INPUT_CLASS =
  'w-full h-12 pl-11 pr-4 rounded-2xl bg-[#1A1D24] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5A2D]';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 rounded-2xl bg-[#FF5A2D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,90,45,0.35)] disabled:opacity-60 transition"
    >
      {pending ? 'Patientez…' : label}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}

function GoogleButton({ next }: { next?: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-2xl bg-white text-[#0F1115] font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
          />
          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
          <path
            fill="#EA4335"
            d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
          />
        </svg>
        {pending ? 'Redirection…' : 'Continuer avec Google'}
      </button>
    </>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const [signInState, runSignIn] = useActionState<AuthActionState, FormData>(signInAction, {
    step: 'credentials',
    mode: 'signin',
  });
  const [signUpState, runSignUp] = useActionState<AuthActionState, FormData>(signUpAction, {
    step: 'credentials',
    mode: 'signup',
  });
  const [verifyState, runVerify] = useActionState<AuthActionState, FormData>(verifyEmailOtpAction, {
    step: 'otp',
    mode: 'signin',
  });
  const [resendState, runResend] = useActionState<AuthActionState, FormData>(resendEmailOtpAction, {
    step: 'otp',
    mode: 'signin',
  });

  const pendingState = tab === 'signin' ? signInState : signUpState;
  const showOtp = pendingState.step === 'otp' && Boolean(pendingState.email);
  const email = verifyState.email ?? pendingState.email ?? '';

  const error = showOtp ? verifyState.error ?? resendState.error : pendingState.error;
  const message = showOtp ? resendState.message ?? pendingState.message : pendingState.message;

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 text-[#FF5A2D] mb-2">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Connexion sécurisée</span>
      </div>

      {showOtp ? (
        <>
          <h1 className="text-2xl font-extrabold">Vérifiez votre e-mail</h1>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            Un code à 6 chiffres a été envoyé à {email}. Il expire au bout de quelques minutes.
          </p>

          <form action={runVerify} className="space-y-3">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="mode" value={pendingState.mode} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <label htmlFor="token" className="block text-xs font-bold text-gray-300">
              Code de vérification
            </label>
            <input
              id="token"
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              placeholder="123456"
              className="w-full h-12 px-4 rounded-2xl bg-[#1A1D24] border border-white/10 text-center tracking-[0.5em] text-lg font-extrabold text-white placeholder:text-gray-700 focus:outline-none focus:border-[#FF5A2D]"
            />
            <SubmitButton label="Valider" />
          </form>

          <form action={runResend} className="mt-3">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="mode" value={pendingState.mode} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <button type="submit" className="text-xs text-gray-400 hover:text-white transition">
              Renvoyer un code
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold">
            {tab === 'signin' ? 'Content de vous revoir' : 'Créez votre compte'}
          </h1>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            E-mail et mot de passe, avec un code de vérification envoyé par e-mail. Vous pouvez
            continuer à parcourir les annonces sans compte.
          </p>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#1A1D24] border border-white/10 mb-4">
            {(['signin', 'signup'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`h-9 rounded-xl text-xs font-bold transition ${
                  tab === value ? 'bg-[#FF5A2D] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {value === 'signin' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form action={tab === 'signin' ? runSignIn : runSignUp} className="space-y-3">
            {next ? <input type="hidden" name="next" value={next} /> : null}

            {tab === 'signup' ? (
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="Votre nom"
                  className={INPUT_CLASS}
                />
              </div>
            ) : null}

            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                defaultValue={pendingState.email ?? ''}
                placeholder="vous@exemple.com"
                className={INPUT_CLASS}
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type="password"
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={tab === 'signup' ? 8 : undefined}
                placeholder={tab === 'signup' ? '8 caractères minimum' : 'Mot de passe'}
                className={INPUT_CLASS}
              />
            </div>

            <SubmitButton label={tab === 'signin' ? 'Se connecter' : 'Créer mon compte'} />
          </form>

          <div className="flex items-center gap-3 my-4 text-[10px] uppercase tracking-wider text-gray-600">
            <span className="h-px flex-1 bg-white/10" />
            ou
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form action={signInWithGoogleAction}>
            <GoogleButton next={next} />
          </form>
        </>
      )}

      {message && !error ? <p className="mt-4 text-xs text-emerald-400">{message}</p> : null}
      {error ? (
        <p role="alert" className="mt-4 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
