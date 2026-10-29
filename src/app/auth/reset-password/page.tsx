'use client';

import { ShieldSpinLoader } from '@/components/custom/loading';
import useVolunteersResetPassword from '@/hooks/use-volunteers-reset-password';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const {
    showPass,
    setShowPass,
    isLoading,
    register,
    handleSubmit,
    errors,
    onSubmit,
  } = useVolunteersResetPassword();
  const [showConfirmField, setShowConfirmField] = useState(false);

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-orange-50 px-4 py-12"
      style={{
        fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600">
          <Lock className="h-6 w-6 text-white" />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-700">
          Account security
        </p>

        <h1
          className="mb-2 text-2xl font-bold tracking-tight text-stone-900"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Set a new password
        </h1>
        <p className="mb-7 text-sm text-stone-500">
          Choose a strong password you haven&apos;t used before.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-stone-700"
            >
              New password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg border bg-gray-50 px-4 py-3.5 text-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute hover:cursor-pointer right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-stone-700"
            >
              Confirm new password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmField ? 'text' : 'password'}
                placeholder="Re-enter password"
                className="w-full rounded-lg border bg-gray-50 px-4 py-3.5 text-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmField(!showConfirmField)}
                aria-label={
                  showConfirmField ? 'Hide password' : 'Show password'
                }
                className="absolute hover:cursor-pointer right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
              >
                {showConfirmField ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg hover:cursor-pointer bg-orange-500 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2 text-center">
                <ShieldSpinLoader color="text-white" size={20} />
                Updating...
              </span>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
