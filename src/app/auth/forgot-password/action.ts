'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validation/schema';

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid email.',
    };
  }
  const { email } = parsed.data;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
  });

  if (error) console.error('resetPasswordForEmail error:', error.message);

  return { success: true };
}
