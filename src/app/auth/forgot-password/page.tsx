'use client';

import { ShieldSpinLoader } from '@/components/custom/loading';
import useVolunteersForgotPassword from '@/hooks/use-volunteers-forgot-password';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const {
    isLoading,
    sent,
    register,
    handleSubmit,
    errors,
    onSubmit,
    getValues,
  } = useVolunteersForgotPassword();

  if (sent) {
    return (
      <div className="flex flex-col items-center px-6 py-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-lg bg-linear-to-br from-orange-400 to-orange-600 shadow-lg">
            <Mail className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="mb-4 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
            Password Reset
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Check your email
        </h1>

        <p className="mt-4 max-w-md text-sm leading-7 text-gray-500">
          If an account exists for
        </p>

        <p className="mt-1 rounded-lg bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 break-all">
          {getValues('email')}
        </p>

        <p className="mt-4 max-w-md text-sm leading-7 text-gray-500">
          We&apos;ve sent a secure password reset link. Please check your inbox
          and follow the instructions to create a new password.
        </p>

        <div className="mt-6 w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
          <p className="text-sm font-medium text-gray-900">
            Didn&apos;t receive the email?
          </p>

          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            <li>• Check your Spam or Junk folder.</li>
            <li>• Make sure the email address is correct.</li>
            <li>• Wait a few minutes before requesting another email.</li>
          </ul>
        </div>

        <Link
          href="/auth/login"
          className="mt-8 inline-flex hover:cursor-pointer items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-600 transition-all duration-200 hover:border-orange-300 hover:bg-orange-100 hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-6 w-fit">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-lg bg-linear-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/25">
            <KeyRound className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="mb-4 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
            Password Recovery
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Forgot your password?
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
          No worries! Enter your email address below and we&apos;ll send you a
          secure link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Email Address
          </label>

          <input
            id="email"
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border bg-gray-50 px-4 py-3.5 text-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-100"
          />

          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:cursor-pointer shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex gap-2">
              <ShieldSpinLoader color="text-white" size={20} />
              Sending reset link...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            We&apos;ll only send a reset link if an account exists for this
            email address.
          </p>
        </div>
      </form>
    </div>
  );
}
