import { db } from '@/lib/db';
import { count, eq } from 'drizzle-orm';
import { volunteerApplications } from '../schema';

export async function getPendingApplicants() {
  const pending = await db
    .select({ count: count() })
    .from(volunteerApplications)
    .where(eq(volunteerApplications.applicationStatus, 'pending'))
    .then((r) => r[0].count);

  return pending;
}
