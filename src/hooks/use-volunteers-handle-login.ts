// src/hooks/useVolunteersHandleLogin.ts
'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoginInput, loginSchema } from '@/lib/validation/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const useVolunteersHandleLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(data);

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('Please verify your email first.');
          router.push(
            '/auth/verify-email?email=' + encodeURIComponent(data.email),
          );
          return;
        }
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          toast.error('Incorrect email or password.');
          return;
        }
        throw error;
      }

      router.push(searchParams.get('redirect') || '/profile');
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Login failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        },
      });
    } catch (error) {
      toast.error(`Error: ${error}`);
      setIsGoogleLoading(false);
    }
  };

  return {
    showPass,
    setShowPass,
    isLoading,
    isGoogleLoading,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleGoogleSignIn,
  };
};

export default useVolunteersHandleLogin;
