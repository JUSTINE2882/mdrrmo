'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function resendVerificationEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  if (!email) return { success: false, error: 'Email is required.' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/profile`,
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
