'use client';

import { ShieldSpinLoader } from '@/components/custom/loading';
import { Icons } from '@/constant/icons';
import useVolunteersHandleLogin from '@/hooks/use-volunteers-handle-login';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const LoginForm = () => {
  const {
    showPass,
    setShowPass,
    isLoading,
    isGoogleLoading,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleGoogleSignIn,
  } = useVolunteersHandleLogin();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          {...register('email')}
          className={fieldCls}
        />
        {errors.email && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" /> {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-orange-500 hover:text-orange-300"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className={fieldCls}
          />
          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" /> {errors.password.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Toggle password"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all duration-300 hover:cursor-pointer hover:bg-orange-400 disabled:bg-orange-200 "
      >
        {isLoading ? (
          <>
            <ShieldSpinLoader size={24} color="text-white" />
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium text-gray-400">
          or continue with
        </span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 transition-colors hover:cursor-pointer hover:bg-gray-50"
      >
        {isGoogleLoading ? (
          <ShieldSpinLoader size={24} />
        ) : (
          <Icons.GoogleIcon />
        )}
        Continue with Google
      </button>
    </form>
  );
};

const fieldCls =
  'w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition';

export default LoginForm;
