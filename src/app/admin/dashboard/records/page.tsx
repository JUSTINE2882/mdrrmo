import { RecordsClient } from '@/components/admin/records-client';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { getDeployments } from '@/lib/db/queries/deployments.queries';
import { getRoleSlotsWithApplicants } from '@/lib/db/queries/role-slots.queries';
import { redirect } from 'next/navigation';

export default async function RecordsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  const [roleSlots, deployments] = await Promise.all([
    getRoleSlotsWithApplicants(),
    getDeployments(),
  ]);

  return <RecordsClient roleSlots={roleSlots} deployments={deployments} />;
}
