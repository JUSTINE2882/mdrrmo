import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import {
  announcements,
  hiredVolunteers,
  volunteerApplications,
  volunteerProfiles,
} from '@/lib/db/schema';
import { count, desc, eq, ne } from 'drizzle-orm';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock,
  Eye,
  Megaphone,
  TrendingUp,
  User,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

const role = 'Volunteer';

const statusConfig = {
  pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Under_Review', class: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', class: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
};

export default async function DashboardPage() {
  const admin = await getAdminSession();

  const [
    totalApplicants,
    pendingApplicants,
    approvedApplicants,
    rejectApplicants,
    totalHired,
    recentApplications,
    activeAnnouncements,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(volunteerApplications)
      .where(ne(volunteerApplications.applicationStatus, 'draft'))
      .then((r) => r[0].count),
    db
      .select({ count: count() })
      .from(volunteerApplications)
      .where(eq(volunteerApplications.applicationStatus, 'pending'))
      .then((r) => r[0].count),
    db
      .select({ count: count() })
      .from(volunteerApplications)
      .where(eq(volunteerApplications.applicationStatus, 'approved'))
      .then((r) => r[0].count),
    db
      .select({ count: count() })
      .from(volunteerApplications)
      .where(eq(volunteerApplications.applicationStatus, 'rejected'))
      .then((r) => r[0].count),
    db
      .select({ count: count() })
      .from(hiredVolunteers)
      .where(eq(hiredVolunteers.status, 'active'))
      .then((r) => r[0].count),
    db
      .select({
        id: volunteerApplications.id,
        avatar: volunteerApplications.photoUrl,
        status: volunteerApplications.applicationStatus,
        submittedAt: volunteerApplications.submittedAt,
        firstName: volunteerProfiles.firstName,
        lastName: volunteerProfiles.lastName,
        email: volunteerProfiles.email,
      })
      .from(volunteerApplications)
      .leftJoin(
        volunteerProfiles,
        eq(volunteerApplications.volunteerId, volunteerProfiles.id),
      )
      .where(ne(volunteerApplications.applicationStatus, 'draft'))
      .orderBy(desc(volunteerApplications.submittedAt))
      .limit(6),
    db
      .select({ count: count() })
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .then((r) => r[0].count),
  ]);

  const stats = [
    {
      label: 'Total Applicants',
      value: totalApplicants,
      change: 'All time',
      positive: true,
      icon: User,
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Pending Review',
      value: pendingApplicants,
      change: 'Needs review',
      positive: false,
      icon: Clock,
      color: 'bg-amber-500',
      light: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Total Volunteers',
      value: totalHired,
      change: 'Verified and Active',
      positive: true,
      icon: UserCheck,
      color: 'bg-green-500',
      light: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Announcement',
      value: activeAnnouncements,
      change: 'Current Active',
      positive: true,
      icon: Megaphone,
      color: 'bg-purple-500',
      light: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="mx-auto w-full space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {admin?.lastLoginAt
              ? new Date(admin?.lastLoginAt).toLocaleDateString('en-PH', {
                  dateStyle: 'medium',
                })
              : '-'}{' '}
            — Welcome back, {admin?.displayName}
          </p>
        </div>
      </div>

      {pendingApplicants ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingApplicants} application
              {Number(pendingApplicants) !== 1 ? 's' : ''} awaiting review
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              Review and process pending volunteer applications to keep the
              system up to date.
            </p>
          </div>
          <Link
            href="/admin/dashboard/applicants"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800"
          >
            Review now <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`h-11 w-11 ${stat.light} flex items-center justify-center rounded-lg`}
              >
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}
              >
                {stat.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <Activity className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg border mb-10 min-h-40 h-fit border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h3 className="text-sm font-medium text-gray-700">
              Recent Applicants
            </h3>
            <Link
              href="/admin/dashboard/applicants"
              className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-300"
            >
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentApplications.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                No data found.
              </div>
            ) : (
              recentApplications.map((applicant, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    {applicant.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${applicant.avatar}`}
                        alt={`${applicant.avatar}`}
                        className="rounded-full h-9 w-9 object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {applicant.firstName} {applicant.lastName}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {applicant.submittedAt
                        ? new Date(applicant.submittedAt).toLocaleDateString(
                            'en-PH',
                            { dateStyle: 'medium' },
                          )
                        : '-'}{' '}
                      · {role}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[applicant.status as keyof typeof statusConfig]?.class}`}
                  >
                    {
                      statusConfig[
                        applicant.status as keyof typeof statusConfig
                      ]?.label
                    }
                  </span>
                  <Link
                    href={`/admin/dashboard/applicants?id=${applicant.id}`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Review Pending Applications',
                  href: '/admin/dashboard/applicants?status=pending',
                  icon: Clock,
                  badge: pendingApplicants,
                },
                {
                  label: 'Create Announcement',
                  href: '/admin/dashboard/announcements?new=1',
                  icon: TrendingUp,
                },
                {
                  label: 'View Verified Volunteers',
                  href: '/admin/dashboard/hired-volunteers',
                  icon: UserCheck,
                },
                {
                  label: 'System Settings',
                  href: '/admin/dashboard/settings',
                  icon: Building2,
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-orange-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 transition-colors group-hover:bg-orange-500">
                    <action.icon className="h-4 w-4 text-orange-500 transition-colors group-hover:text-white" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {action.label}
                  </span>
                  {action.badge && (
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      {action.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-orange-500" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-linear-to-br from-orange-300 mb-10 to-orange-500 p-5 text-white">
            <h3 className="mb-1 text-sm font-semibold">Monthly Summary</h3>
            <p className="mb-4 text-xs text-orange-100">
              June 2026 performance overview
            </p>
            <div className="space-y-3">
              {[
                {
                  label: 'Applications received',
                  value: String(totalApplicants),
                },
                {
                  label: 'Verified Applicants',
                  value: String(approvedApplicants),
                },
                { label: 'Active volunteers', value: String(totalHired) },
                {
                  label: 'Active announcements',
                  value: String(activeAnnouncements),
                },
                {
                  label: 'Rejected applicants',
                  value: String(rejectApplicants),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-orange-100">{item.label}</span>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
