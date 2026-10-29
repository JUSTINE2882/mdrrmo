import { createServerClient } from '@supabase/ssr';
import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-change-in-production',
);

const PROTECTED_PREFIXES = ['/profile'];
const SESSION_REQUIRED_EXACT = ['/auth/reset-password'];
const REDIRECT_IF_LOGGED_IN = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('mdrrmo_admin_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    try {
      await jwtVerify(token, ADMIN_JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL('/admin/login?reason=session_expired', request.url),
      );
      response.cookies.delete('mdrrmo_admin_session');
      return response;
    }
  }

  if (pathname === '/admin/login') {
    const token = request.cookies.get('mdrrmo_admin_session')?.value;
    if (token) {
      try {
        await jwtVerify(token, ADMIN_JWT_SECRET);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {}
    }
  }

  const needsUserCheck =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    SESSION_REQUIRED_EXACT.includes(pathname) ||
    REDIRECT_IF_LOGGED_IN.some((p) => pathname.startsWith(p));

  if (!needsUserCheck) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
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

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const needsSession = SESSION_REQUIRED_EXACT.includes(pathname);
  const isAuthPage = REDIRECT_IF_LOGGED_IN.some((p) => pathname.startsWith(p));

  if ((isProtected || needsSession) && !user) {
    const target = needsSession ? '/auth/forgot-password' : '/auth/login';
    const url = new URL(target, request.url);
    if (isProtected) url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/login',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],
};
