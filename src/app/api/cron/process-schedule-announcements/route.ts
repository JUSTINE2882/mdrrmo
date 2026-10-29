import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { sendAnnouncementToApprovedVolunteers } from '@/lib/email/resend';
import { and, eq, lte } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  const due = await db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.status, 'scheduled'),
        lte(announcements.scheduledAt, now),
      ),
    );

  const results = [];

  for (const announcement of due) {
    // Flip to published *before* sending — if the email batch takes a while
    // and the next cron tick overlaps, it won't pick this row up again.
    await db
      .update(announcements)
      .set({ status: 'published', publishedAt: now, isActive: true })
      .where(eq(announcements.id, announcement.id));

    const { sent } = await sendAnnouncementToApprovedVolunteers(announcement);
    results.push({
      id: announcement.id,
      title: announcement.title,
      emailsSent: sent,
    });
  }

  return NextResponse.json({ processed: results.length, results });
}
