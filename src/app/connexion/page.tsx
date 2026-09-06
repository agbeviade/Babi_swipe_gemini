import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { getSessionUser } from '@/lib/auth/session';

export const metadata = { title: 'Connexion — BABI SWIPE IMMO' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(next?.startsWith('/') ? next : '/');

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center px-6">
      <LoginForm next={next?.startsWith('/') ? next : undefined} />
      <Link href="/" className="mt-8 text-xs text-gray-500 hover:text-gray-300 transition">
        Continuer sans compte
      </Link>
    </main>
  );
}
