import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function extractGoogleName(meta: Record<string, unknown>) {
  const givenName = meta.given_name as string | undefined;
  const familyName = meta.family_name as string | undefined;
  if (givenName || familyName) {
    return { firstName: givenName ?? '', lastName: familyName ?? '' };
  }

  const fullName = (meta.full_name ?? meta.name) as string | undefined;
  if (fullName) {
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    return { firstName: firstName || 'User', lastName: rest.join(' ') };
  }

  return { firstName: 'User', lastName: '' };
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  if (!code) {
    console.error('[auth/callback] No code param on request:', request.url);
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error(
      '[auth/callback] exchangeCodeForSession failed:',
      error?.message,
      error,
    );
    return NextResponse.redirect(
      `${origin}/auth/login?error=auth_failed&reason=${encodeURIComponent(error?.message ?? 'no_user')}`,
    );
  }

  const user = data.user;
  const meta = user.user_metadata;

  const { firstName, lastName } =
    meta.first_name || meta.last_name
      ? { firstName: meta.first_name ?? '', lastName: meta.last_name ?? '' }
      : extractGoogleName(meta);

  try {
    await db
      .insert(schema.volunteerProfiles)
      .values({
        id: user.id,
        firstName,
        lastName,
        email: user.email!,
        emailVerified: !!user.email_confirmed_at,
        avatarUrl: meta.avatar_url ?? null,
      })
      .onConflictDoUpdate({
        target: schema.volunteerProfiles.id,
        set: { emailVerified: !!user.email_confirmed_at },
      });
  } catch (err) {
    console.error('[auth/callback] Profile upsert failed:', err);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
