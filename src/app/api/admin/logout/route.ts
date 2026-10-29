import { clearAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { adminUsers } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST() {
  const admin = await db
    .select()
    .from(adminUsers)
    .limit(1)
    .then((rows) => rows[0] ?? null);

  await clearAdminSession();
  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'admin_logout',
  });
  return NextResponse.json({ success: true });
}
