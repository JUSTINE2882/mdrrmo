import type { AdminPayload } from '@/types';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mdrrmo_admin_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-change-in-production',
);
const EXPIRES_IN = '8h'; // admin session duration

// ─── Sign a new admin JWT ─────────────────────────────────────────────────────
export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
}

// ─── Verify & decode ──────────────────────────────────────────────────────────
export async function verifyAdminToken(
  token: string,
): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

// ─── Set cookie after login ───────────────────────────────────────────────────
export async function setAdminSession(payload: AdminPayload) {
  const token = await signAdminToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours in seconds
    path: '/',
  });
}

// ─── Clear cookie on logout ───────────────────────────────────────────────────
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Get current admin from cookie ───────────────────────────────────────────
export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// ─── Require admin (throws redirect-like null if not authenticated) ───────────
export async function requireAdmin(): Promise<AdminPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED'); // catch this in middleware / layout
  }
  return session;
}
