import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { announcements } from '@/lib/db/schema';
import { announcementSchema } from '@/lib/validation/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db.delete(announcements).where(eq(announcements.id, id));
  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'announcement_deleted',
  });

  return NextResponse.json({ success: true });
}

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
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

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
        { error: 'Published announcements can no longer be edited.' },
        { status: 409 },
      );
    }

    const data = parsed.data;

    const [updated] = await db
      .update(announcements)
      .set({
        title: data.title,
        body: data.body,
        type: data.type,
        tags: data.tags,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        repeatBroadcast: data.repeatBroadcast,
        broadcastFrequency: data.broadcastFrequency ?? null,
        // status/scheduledAt untouched on purpose — editing a draft or
        // scheduled item doesn't change when or whether it goes out.
      })
      .where(eq(announcements.id, id))
      .returning();

    await logActivity({
      adminId: admin.id,
      name: admin.username,
      action: 'announcement_updated',
      targetType: 'announcement_updated',
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// keep your existing DELETE export below this, unchanged
