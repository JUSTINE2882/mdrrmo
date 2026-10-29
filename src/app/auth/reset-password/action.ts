'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validation/schema';

export async function updatePassword(
  input: ResetPasswordInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
