import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { adminUsers } from '@/lib/db/schema';
import { adminProfileSchema } from '@/lib/validation/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = adminProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { displayName, email } = parsed.data;

    const user = await db
      .select({ displayName: adminUsers.displayName, email: adminUsers.email })
      .from(adminUsers)
      .where(eq(adminUsers.id, admin.id))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!user) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    await db
      .update(adminUsers)
      .set({ displayName: displayName, email: email, updatedAt: new Date() })
      .where(eq(adminUsers.id, admin.id));
    await logActivity({
      adminId: admin.id,
      name: admin.username,
      action: 'admin_profile_updated',
      targetLabel: displayName,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
