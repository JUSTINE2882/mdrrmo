import { ApplicantsTable } from '@/components/admin/applicants-table';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { volunteerApplications } from '@/lib/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const APPLICANT_STATUSES = ['pending', 'under_review', 'rejected'] as const;

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  const statusFilter = searchParams.status as
    'pending' | 'under_review' | 'rejected' | undefined;

  const rows = await db
    .select()
    .from(volunteerApplications)
    .where(
      statusFilter
        ? eq(volunteerApplications.applicationStatus, statusFilter)
        : inArray(volunteerApplications.applicationStatus, APPLICANT_STATUSES),
    )
    .orderBy(desc(volunteerApplications.submittedAt));

  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.applicationStatus === 'pending').length,
    under_review: rows.filter((r) => r.applicationStatus === 'under_review')
      .length,
    rejected: rows.filter((r) => r.applicationStatus === 'rejected').length,
  };

  return (
    <div className="w-full mb-10">
      <ApplicantsTable
        applicants={rows}
        counts={counts}
        currentStatus={statusFilter ?? 'all'}
      />
    </div>
  );
}
