'use server';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { registerSchema, type RegisterInput } from '@/lib/validation/schema';

interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function registerVolunteer(
  input: RegisterInput,
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input.',
    };
  }
  const { firstName, lastName, email, password } = parsed.data;

  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/profile`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return {
        success: false,
        error:
          'An account with this email already exists. Try signing in or resetting your password.',
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
