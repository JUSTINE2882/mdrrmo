import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { findAvailableRole } from '@/lib/db/queries/role-slots.queries';
import {
  hiredVolunteers,
  volunteerApplications,
  volunteerProfiles,
} from '@/lib/db/schema';
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from '@/lib/email/resend';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject', 'under_review']),
  notes: z.string().optional(),
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
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { action, notes } = parsed.data;
    const { id: applicationId } = await params;

    const application = await db
      .select({
        id: volunteerApplications.id,
        volunteerId: volunteerApplications.volunteerId,
        status: volunteerApplications.applicationStatus,
        primaryRole: volunteerApplications.primaryRole,
        secondaryRole: volunteerApplications.secondaryRole,
      })
      .from(volunteerApplications)
      .where(eq(volunteerApplications.id, applicationId))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 },
      );
    }

    let assignedRole: string | null = null;
    let usedFallback = false;

    if (action === 'approve') {
      const placement = await findAvailableRole(
        application.primaryRole,
        application.secondaryRole,
      );

      if (!placement) {
        return NextResponse.json(
          {
            error: `Both "${application.primaryRole}" and "${application.secondaryRole}" are currently full. Increase capacity in Records, or reject/hold this application instead.`,
          },
          { status: 409 },
        );
      }

      assignedRole = placement.assignedRole;
      usedFallback = placement.usedFallback;
    }

    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      under_review: 'under_review' as const,
    };

    await db
      .update(volunteerApplications)
      .set({
        applicationStatus: statusMap[action],
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        reviewNotes: notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(volunteerApplications.id, applicationId));

    if (action === 'approve' && assignedRole) {
      await db
        .insert(hiredVolunteers)
        .values({
          volunteerId: application.volunteerId,
          applicationId: application.id,
          role: assignedRole,
          status: 'active',
          hiredBy: admin.id,
        })
        .onConflictDoNothing();
    }

    const profile = await db
      .select({
        firstName: volunteerProfiles.firstName,
        lastName: volunteerProfiles.lastName,
        email: volunteerProfiles.email,
      })
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.id, application.volunteerId))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (profile?.email) {
      if (action === 'approve') {
        await sendApplicationApprovedEmail(
          profile.email,
          profile.firstName,
        ).catch(console.error);
      } else if (action === 'reject') {
        await sendApplicationRejectedEmail(
          profile.email,
          profile.firstName,
          notes,
        ).catch(console.error);
      }
    }

    const applicantName = profile
      ? `${profile.firstName} ${profile.lastName}`
      : 'Unknown applicant';

    if (action === 'reject') {
      await logActivity({
        adminId: admin.id,
        name: applicantName,
        action: 'applicant_rejected',
      });
    } else if (action === 'approve') {
      await logActivity({
        adminId: admin.id,
        name: applicantName,
        action: 'applicant_approved',
        details: { assignedRole, usedFallback },
      });
    } else if (action === 'under_review') {
      await logActivity({
        adminId: admin.id,
        name: applicantName,
        action: 'applicant_marked_under_review',
      });
    }

    return NextResponse.json({ success: true, assignedRole, usedFallback });
  } catch (err) {
    console.error('Review application error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
