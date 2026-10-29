// src/hooks/useForgotPassword.ts
'use client';

import { requestPasswordReset } from '@/app/auth/forgot-password/action';
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
} from '@/lib/validation/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const useVolunteersForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sent,
    register,
    handleSubmit,
    errors,
    onSubmit,
    getValues,
  };
};

export default useVolunteersForgotPassword;
