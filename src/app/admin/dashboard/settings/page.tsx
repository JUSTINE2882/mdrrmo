import { AdminSettingsClient } from '@/components/admin/admin-settings-client';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  const user = await db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      displayName: adminUsers.displayName,
      email: adminUsers.email,
      role: adminUsers.role,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, admin.id))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!user) redirect('/admin/login');

  return (
    <div className="w-full mb-10">
      <AdminSettingsClient user={user} />
    </div>
  );
}
