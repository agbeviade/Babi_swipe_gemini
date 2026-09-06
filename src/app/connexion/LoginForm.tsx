'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { requestOtpAction, verifyOtpAction, type AuthActionState } from './actions';

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

export function LoginForm({ next }: { next?: string }) {
  const [requestState, requestAction] = useActionState<AuthActionState, FormData>(
    requestOtpAction,
    { step: 'phone' },
  );
  const [verifyState, verifyAction] = useActionState<AuthActionState, FormData>(verifyOtpAction, {
    step: 'otp',
  });

  const phone = verifyState.phone ?? requestState.phone;
  const showOtp = requestState.step === 'otp' && Boolean(phone);
  const error = showOtp ? verifyState.error : requestState.error;

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 text-[#FF5A2D] mb-2">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Connexion sécurisée</span>
      </div>
      <h1 className="text-2xl font-extrabold">Votre numéro, c&apos;est votre compte</h1>
      <p className="text-sm text-gray-400 mt-2 mb-6">
        Un code à 6 chiffres vous est envoyé par SMS. Vous pouvez continuer à parcourir les annonces
        sans compte.
      </p>

      {!showOtp ? (
        <form action={requestAction} className="space-y-3">
          <label htmlFor="phone" className="block text-xs font-bold text-gray-300">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              defaultValue={requestState.phone ?? '+225'}
              placeholder="+225XXXXXXXXXX"
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#1A1D24] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5A2D]"
            />
          </div>
          <SubmitButton label="Recevoir mon code" />
        </form>
      ) : (
        <form action={verifyAction} className="space-y-3">
          <input type="hidden" name="phone" value={phone} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <label htmlFor="token" className="block text-xs font-bold text-gray-300">
            Code reçu au {phone}
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
      )}

      {requestState.message && !error ? (
        <p className="mt-4 text-xs text-emerald-400">{requestState.message}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
