import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { announcements } from '@/lib/db/schema';
import { sendAnnouncementToApprovedVolunteers } from '@/lib/email/resend';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const scheduledAtInput = body?.scheduledAt as string | undefined;

    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 },
      );
    }

    if (existing.status === 'published') {
      return NextResponse.json(
        { error: 'This announcement has already been published.' },
        { status: 409 },
      );
    }

    const now = new Date();
    const scheduledAt = scheduledAtInput ? new Date(scheduledAtInput) : now;
    const isFuture = scheduledAt.getTime() > now.getTime() + 60_000;

    const [updated] = await db
      .update(announcements)
      .set({
        status: isFuture ? 'scheduled' : 'published',
        scheduledAt,
        publishedAt: isFuture ? null : now,
        isActive: !isFuture,
      })
      .where(eq(announcements.id, id))
      .returning();

    if (!isFuture) {
      const { sent } = await sendAnnouncementToApprovedVolunteers(updated);
      await logActivity({
        adminId: admin.id,
        name: admin.username,
        action: 'announcement_published',
      });
      return NextResponse.json({
        success: true,
        status: updated.status,
        emailsSent: sent,
      });
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
