import { LogsClient } from '@/components/admin/logs-client';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { getActivityLogs } from '@/lib/db/queries/activity-logs.queries';
import { redirect } from 'next/navigation';

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const actions =
    params.action && params.action !== 'all'
      ? params.action.split(',')
      : undefined;

  console.log(actions);

  const { logs, total } = await getActivityLogs({ page, actions });

  return (
    <div className="mb-10 w-full">
      <LogsClient
        logs={logs}
        total={total}
        currentPage={page}
        currentAction={params.action ?? 'all'}
      />
    </div>
  );
}
