import { setAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { adminUsers } from '@/lib/db/schema';
import { adminLoginSchema } from '@/lib/validation/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;

    // Find admin by username
    const admin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!admin || !admin.isActive) {
      // Use same message to prevent username enumeration
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    // Update last login timestamp
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, admin.id));

    // Set JWT cookie
    await setAdminSession({
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt,
    });

    await logActivity({
      adminId: admin.id,
      name: admin.username,
      action: 'admin_login',
    });

    return NextResponse.json({
      success: true,
      displayName: admin.displayName,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
