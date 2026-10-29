// src/hooks/useResetPassword.ts
'use client';

import { updatePassword } from '@/app/auth/reset-password/action';
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from '@/lib/validation/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const useVolunteersResetPassword = () => {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      const result = await updatePassword(data);
      if (!result.success) {
        toast.error(result.error ?? 'Could not update password.');
        return;
      }
      toast.success('Password updated.');
      router.push('/profile');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showPass,
    setShowPass,
    showConfirm,
    setShowConfirm,
    isLoading,
    register,
    handleSubmit,
    errors,
    onSubmit,
  };
};

export default useVolunteersResetPassword;
