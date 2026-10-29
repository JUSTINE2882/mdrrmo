import { AnnouncementsClient } from '@/components/admin/announcements-client';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const params = await searchParams;

  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  const list = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt));

  return (
    <div className="mb-10 w-full">
      <AnnouncementsClient
        announcements={list}
        openComposer={params.new === '1'}
      />
    </div>
  );
}
