import { LOGS_PAGE_SIZE } from '@/data/admin/logs';
import { db } from '@/lib/db';
import { activityLogs } from '@/lib/db/schema';
import { desc, inArray, sql } from 'drizzle-orm';

export type LogAction =
  | 'admin_login'
  | 'admin_logout'
  | 'admin_password_changed'
  | 'admin_profile_updated'
  | 'applicant_approved'
  | 'applicant_rejected'
  | 'applicant_marked_under_review'
  | 'announcement_scheduled'
  | 'announcement_updated'
  | 'announcement_published'
  | 'announcement_deleted'
  | 'role_slot_created'
  | 'role_slot_updated'
  | 'role_slot_deleted'
  | 'deployment_created'
  | 'deployment_updated'
  | 'deployment_deleted'
  | 'new_pending_volunteer_applicant'
  | 'deactivate_account'
  | 'activate_account'
  | 'volunteer_status_changed'
  | 'volunteers_exported';

interface LogActivityInput {
  adminId: number;
  name: string;
  action: LogAction;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  details?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput) {
  try {
    await db.insert(activityLogs).values(input);
  } catch (err) {
    // A logging failure should never break the real action it's describing.
    console.error('Failed to write activity log:', err);
  }
}

export async function getActivityLogs({
  page = 1,
  actions,
}: {
  page?: number;
  actions?: string[];
} = {}) {
  const offset = (page - 1) * LOGS_PAGE_SIZE;
  const whereClause =
    actions && actions.length > 0
      ? inArray(activityLogs.action, actions)
      : undefined;

  const [logs, totalResult] = await Promise.all([
    db
      .select()
      .from(activityLogs)
      .where(whereClause)
      .orderBy(desc(activityLogs.createdAt))
      .limit(LOGS_PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLogs)
      .where(whereClause),
  ]);

  return { logs, total: totalResult[0]?.count ?? 0 };
}
