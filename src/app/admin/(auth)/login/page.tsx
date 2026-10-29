'use client';
import { ShieldSpinLoader } from '@/components/custom/loading';
import { images } from '@/constant/images';
import useAdminHandleLogin from '@/hooks/use-admin-handle-login';

import { AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLoginPage() {
  const {
    sessionExpired,
    showPassword,
    setShowPassword,
    isLoading,
    register,
    handleSubmit,
    errors,
    onSubmit,
  } = useAdminHandleLogin();
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-100 p-4">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-0 overflow-hidden rounded-lg shadow-2xl lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-orange-300 via-orange-500 to-red-500 p-12 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 h-32 w-32 rounded-full border-4 border-white"></div>
            <div className="absolute right-8 bottom-20 h-48 w-48 rounded-full border-4 border-white"></div>
            <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"></div>
          </div>
          <div className="relative z-10 space-y-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
              <Image src={images.logo} alt="LOGO" className="" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">MDRRMO</h1>
              <p className="mt-1 text-sm font-medium tracking-widest text-orange-100 uppercase">
                Mansalay
              </p>
            </div>
            <div className="mx-auto h-0.5 w-16 bg-white/40"></div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Accreditation &amp; Volunteer
              </h2>
              <h2 className="text-xl font-semibold">Management System</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-orange-100">
              Centralized platform for managing volunteer registrations,
              accreditation, training records, and disaster response
              coordination.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { label: 'Volunteers', value: '200+' },
                { label: 'Organizations', value: '50+' },
                { label: 'Deployments', value: '80+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="mt-1 text-xs text-orange-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white lg:p-12 md:p-12 px-6 py-8">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-500">
                <Shield className="h-4 w-4" />
                ADMIN PORTAL
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome back</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sign in to your admin account to continue
              </p>
            </div>

            {sessionExpired && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Your session expired. Please sign in again.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="Enter your username"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                {errors.username && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />{' '}
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:cursor-pointer hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />{' '}
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-lg border-gray-300  accent-orange-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-orange-500 hover:text-orange-300"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-orange-300 to-orange-500 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:transition-all hover:duration-300 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <ShieldSpinLoader size={26} color="text-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-400">
                Volunteer portal?{' '}
                <Link
                  href="/"
                  className="font-medium text-orange-500 hover:underline"
                >
                  Register or apply here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
