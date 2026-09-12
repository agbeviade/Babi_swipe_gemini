import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isSupabaseConfigured, publicEnv } from '@/lib/env';

const PROTECTED_PREFIXES = ['/compte', '/pro', '/admin'];

function loginRedirect(request: NextRequest) {
  const loginUrl = new URL('/connexion', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const needsAuth = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  // Sans Supabase, aucune session ne peut exister : les zones protégées restent fermées.
  if (!isSupabaseConfigured()) {
    return needsAuth ? loginRedirect(request) : response;
  }

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsAuth && !user) {
    return loginRedirect(request);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.svg|.*\\.png).*)'],
};
