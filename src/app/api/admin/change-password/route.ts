// src/app/api/admin/change-password/route.ts
import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { adminUsers } from '@/lib/db/schema';
import { adminChangePasswordSchema } from '@/lib/validation/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = adminChangePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Load current hash
    const user = await db
      .select({ passwordHash: adminUsers.passwordHash })
      .from(adminUsers)
      .where(eq(adminUsers.id, admin.id))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!user) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(adminUsers)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(adminUsers.id, admin.id));

    await logActivity({
      adminId: admin.id,
      name: admin.username,
      action: 'admin_password_changed',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
