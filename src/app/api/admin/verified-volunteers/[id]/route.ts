import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { hiredVolunteers, volunteerApplications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import z from 'zod';

const volunteerStatusSchema = z.object({
  action: z.enum(['active', 'inactive', 'suspended']),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const parsed = volunteerStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { action } = parsed.data;

    const { id: volunteerId } = await params;

    const verifiedVolunteer = await db
      .select({
        id: hiredVolunteers.id,
        volunteerId: hiredVolunteers.volunteerId,
        status: hiredVolunteers.status,
        firstName: volunteerApplications.firstName,
        lastName: volunteerApplications.lastName,
      })
      .from(hiredVolunteers)
      .leftJoin(
        volunteerApplications,
        eq(volunteerApplications.id, hiredVolunteers.applicationId),
      )
      .where(eq(hiredVolunteers.id, volunteerId))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!verifiedVolunteer) {
      return NextResponse.json(
        { error: 'Volunteer not exist' },
        { status: 404 },
      );
    }

    const statusMap = {
      active: 'active' as const,
      inactive: 'inactive' as const,
      suspended: 'suspended' as const,
    };

    await db
      .update(hiredVolunteers)
      .set({ status: statusMap[action], updatedAt: new Date() })
      .where(eq(hiredVolunteers.id, volunteerId));

    if (action === 'active') {
      await logActivity({
        adminId: admin.id,
        name: admin.username,
        action: 'activate_account',
        targetId: verifiedVolunteer.id,
        targetLabel: `${verifiedVolunteer.firstName} ${verifiedVolunteer.lastName}`,
      });
    } else {
      await logActivity({
        adminId: admin.id,
        name: admin.username,
        action: 'deactivate_account',
        targetId: verifiedVolunteer.id,
        targetLabel: `${verifiedVolunteer.firstName} ${verifiedVolunteer.lastName}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Review application error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
