import { DeactivatedNotice } from '@/components/custom/deactivate-notice';
import { statusConfig } from '@/data/status';
import { db } from '@/lib/db';
import { getDeploymentsForVolunteer } from '@/lib/db/queries/deployments.queries';
import {
  hiredVolunteers,
  volunteerApplications,
  volunteerProfiles,
} from '@/lib/db/schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import {
  Award,
  Calendar,
  ChevronRight,
  FileText,
  Shield,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const [profile, application, hiredRecord] = await Promise.all([
    db
      .select()
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.id, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select()
      .from(volunteerApplications)
      .where(eq(volunteerApplications.volunteerId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select()
      .from(hiredVolunteers)
      .where(eq(hiredVolunteers.volunteerId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);

  const statusCfg = application
    ? statusConfig[application.applicationStatus as keyof typeof statusConfig]
    : null;

  const deploymentHistory = hiredRecord
    ? await getDeploymentsForVolunteer(hiredRecord.id)
    : [];

  return (
    <div className="space-y-6 w-full py-10 md:py-0 md:pb-10 mx-auto">
      {hiredRecord?.status === 'inactive' ? (
        <DeactivatedNotice status={hiredRecord.status} />
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Welcome back, {profile?.firstName ?? user.email}
            </p>
          </div>
          {application && statusCfg ? (
            <div className={`rounded-lg border p-5 ${statusCfg.class}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border  bg-white/60">
                  <statusCfg.icon
                    className={`h-6 w-6 ${statusCfg.iconClass}`}
                  />
                </div>

                <div className="flex-1">
                  <p className="font-bold">
                    Application Status: {statusCfg.label}
                  </p>
                  <p className="mt-0.5 text-sm opacity-80">
                    {application.applicationStatus === 'pending' &&
                      "Your application is in the queue. We'll review it within 3–5 business days."}
                    {application.applicationStatus === 'under_review' &&
                      "Our team is currently reviewing your application. You'll hear from us soon."}
                    {application.applicationStatus === 'approved' &&
                      'Congratulations! Your application has been approved. You will be contacted for orientation.'}
                    {application.applicationStatus === 'rejected' &&
                      `Your application was not approved at this time. ${application.reviewNotes ?? ''}`}
                  </p>
                </div>
                <Link
                  href="/profile/apply"
                  className="flex items-center gap-1 text-sm font-semibold"
                >
                  View <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50 p-6 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-orange-400" />
                <h3 className="font-bold text-gray-900">
                  {application?.applicationStatus === 'draft'
                    ? 'Application saved as draft'
                    : 'No Application Yet'}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Start your volunteer application to join MDRRMO Mansalay
                </p>
                {application?.applicationStatus !== 'draft' && (
                  <Link
                    href="/profile/apply"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
                  >
                    Apply Now
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {application?.applicationStatus === 'draft' && (
                <Link
                  href="/profile/apply"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Draft application
                </Link>
              )}
            </>
          )}
          {hiredRecord && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-900">Active Volunteer</p>
                  <p className="text-sm text-green-700">
                    Role: {application.primaryRole} ·{' '}
                    {hiredRecord.deploymentCount} deployment(s)
                  </p>
                </div>
              </div>
            </div>
          )}

          {hiredRecord && (
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-500" />
                <h2 className="font-bold text-gray-900">My Deployments</h2>
                <span className="ml-auto text-xs text-gray-400">
                  {deploymentHistory.length} total
                </span>
              </div>
              {deploymentHistory.length === 0 ? (
                <p className="text-sm text-gray-400">
                  You haven&apos;t been included in any deployments yet.
                </p>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {deploymentHistory.map((d) => (
                    <div key={d.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {d.title}
                          </p>
                          {d.description && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {d.description}
                            </p>
                          )}
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(d.deploymentDate).toLocaleDateString(
                            'en-PH',
                            {
                              dateStyle: 'medium',
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Account Information</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.email_confirmed_at
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {user.email_confirmed_at
                  ? 'Email Verified'
                  : 'Email Not Verified'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'First Name', value: profile?.firstName ?? '—' },
                { label: 'Last Name', value: profile?.lastName ?? '—' },
                { label: 'Email Address', value: user.email ?? '—' },
                { label: 'Account Type', value: 'Volunteer' },
                {
                  label: 'Member Since',
                  value: new Date(user.created_at).toLocaleDateString('en-PH', {
                    dateStyle: 'long',
                  }),
                },
                {
                  label: 'Last Sign In',
                  value: user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString(
                        'en-PH',
                        {
                          dateStyle: 'long',
                        },
                      )
                    : '—',
                },
              ].map((field) => (
                <div key={field.label} className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">{field.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100  bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <h2 className="font-bold text-gray-900">Security</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Change Password
                  </p>
                  <p className="text-xs text-gray-500">
                    Send a password reset link to your email
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
