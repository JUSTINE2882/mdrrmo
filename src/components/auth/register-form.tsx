'use client';

import { ShieldSpinLoader } from '@/components/custom/loading';
import { Icons } from '@/constant/icons';
import useVolunteersHandleRegister from '@/hooks/use-volunteers-handle-register';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const RegisterForm = () => {
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
  } = useVolunteersHandleRegister();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register('firstName')}
            placeholder="Juan"
            className={fieldCls}
          />
          {errors.firstName && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" /> {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register('lastName')}
            placeholder="dela Cruz"
            className={fieldCls}
          />
          {errors.lastName && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" /> {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700">
          Email Address <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="you@email.com"
          className={fieldCls}
        />
        {errors.email && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" /> {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            {...register('password')}
            placeholder="Min. 8 characters"
            className={`${fieldCls} pr-10`}
          />
          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" /> {errors.password.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:cursor-pointer hover:text-gray-600"
            aria-label="Toggle password visibility"
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
            Creating account…
          </>
        ) : (
          'Create Account & Apply'
        )}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 transition-colors hover:cursor-pointer hover:bg-gray-50"
      >
        {isGoogleLoading ? (
          <ShieldSpinLoader size={24} />
        ) : (
          <Icons.GoogleIcon />
        )}
        Continue with Google
      </button>

      <p className="text-center text-xs leading-relaxed text-gray-400">
        By registering you agree to our{' '}
        <Link href="/terms" className="text-orange-500 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-orange-500 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
};

const fieldCls =
  'w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition';

export default RegisterForm;
