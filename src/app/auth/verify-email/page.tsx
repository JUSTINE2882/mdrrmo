// src/app/auth/verify-email/page.tsx
'use client';

import {
  ShieldDrawLoader,
  ShieldSpinLoader,
} from '@/components/custom/loading';
import { AtSign, Clock, Inbox, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { resendVerificationEmail } from './action';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [resending, setResending] = useState(false);

  const resendEmail = async () => {
    setResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (!result.success) throw new Error(result.error);
      toast.success('Verification email resent! Check your inbox.');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to resend. Please try again in a few minutes.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full items-center justify-center bg-orange-50 px-4 py-6"
      style={{
        fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="w-full md:flex md:max-w-4xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
        <div className="flex flex-col w-full items-center text-wrap mx-auto p-8 text-center sm:p-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-700">
            Account verification
          </p>

          <h1
            className="mb-3 text-3xl font-bold tracking-tight text-stone-900"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Check your email
          </h1>

          <p className="mb-3 text-sm text-stone-500">
            We sent a verification link to
          </p>

          <div className="mb-5 inline-flex max-w-full items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5">
            <span className="truncate text-sm font-semibold text-stone-900">
              {email || 'your email address'}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-stone-500 text-wrap">
            Click the link in the email to verify your account. After
            verification, you can log in and start your volunteer application.
          </p>
        </div>

        {/* Perforated divider — a ticket-stub tear line */}
        <div className="md:hidden relative" aria-hidden="true">
          <div className="border-t-2 border-dashed border-stone-200"></div>
          <div className="absolute left-0 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50"></div>
          <div className="absolute right-0 top-0 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-orange-50"></div>
        </div>

        <div className="p-8 pt-6 sm:p-10 sm:pt-7 w-full bg-linear-to-b from-orange-100 to-white flex flex-col justify-center items-center mx-auto text-wrap">
          <div className="rounded-lg w-full border border-stone-200 bg-stone-50 p-5 text-left">
            <p className="mb-3 text-sm font-semibold text-stone-900">
              Didn&apos;t receive the email?
            </p>
            <ul className="space-y-2.5 text-sm text-stone-600">
              <li className="flex items-start gap-2.5">
                <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <span>Make sure you used the right email</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <span>The link expires in 24 hours</span>
              </li>
            </ul>
          </div>

          <button
            onClick={resendEmail}
            disabled={resending || !email}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 hover:cursor-pointer focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            {resending ? (
              <span className="flex items-center justify-center gap-2 text-center">
                <ShieldSpinLoader color="text-white" size={20} />
                Resending...
              </span>
            ) : (
              'Resend verification email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full bg-orange-50 items-center justify-center">
          <ShieldDrawLoader />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
