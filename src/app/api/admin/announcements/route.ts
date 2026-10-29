import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { announcements } from '@/lib/db/schema';
import { sendAnnouncementToApprovedVolunteers } from '@/lib/email/resend';
import { announcementSchema } from '@/lib/validation/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json({ announcements: list });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const now = new Date();

    let status: 'draft' | 'scheduled' | 'published' = 'draft';
    let scheduledAt: Date | null = null;
    let publishedAt: Date | null = null;

    if (data.action === 'publish') {
      const requestedAt = data.scheduledAt ? new Date(data.scheduledAt) : now;
      const isFuture = requestedAt.getTime() > now.getTime() + 60_000;
      status = isFuture ? 'scheduled' : 'published';
      scheduledAt = requestedAt;
      if (status === 'published') publishedAt = now;
    }

    const [announcement] = await db
      .insert(announcements)
      .values({
        title: data.title,
        body: data.body,
        type: data.type,
        tags: data.tags,
        status,
        scheduledAt,
        publishedAt,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        repeatBroadcast: data.repeatBroadcast,
        broadcastFrequency: data.broadcastFrequency ?? null,
        createdBy: admin.id,
        isActive: status === 'published',
      })
      .returning();

    if (status === 'published') {
      const { sent } = await sendAnnouncementToApprovedVolunteers(announcement);
      await logActivity({
        adminId: admin.id,
        name: admin.username,
        action: 'announcement_published',
      });
      return NextResponse.json({
        success: true,
        id: announcement.id,
        status,
        emailsSent: sent,
      });
    } else if (status === 'scheduled') {
      await logActivity({
        adminId: admin.id,
        name: admin.username,
        action: 'announcement_scheduled',
      });
    }

    return NextResponse.json({ success: true, id: announcement.id, status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
