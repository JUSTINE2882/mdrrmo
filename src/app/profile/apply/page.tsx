import { DeactivatedNotice } from '@/components/custom/deactivate-notice';
import { ApplicationFormClient } from '@/components/volunteer/forms/application-form';
import { db } from '@/lib/db';
import { getAvailableRolesForApplicants } from '@/lib/db/queries/role-slots.queries';
import {
  hiredVolunteers,
  volunteerApplications,
  volunteerProfiles,
} from '@/lib/db/schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ApplyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/apply');
  }

  const profile = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.id, user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const existingApplication = await db
    .select()
    .from(volunteerApplications)
    .where(eq(volunteerApplications.volunteerId, user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const [hiredRecord] = await Promise.all([
    db
      .select()
      .from(hiredVolunteers)
      .where(eq(hiredVolunteers.volunteerId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);

  const userData = profile
    ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      }
    : null;

  const availableRoles = await getAvailableRolesForApplicants();

  if (hiredRecord?.status === 'inactive') {
    return <DeactivatedNotice status={hiredRecord.status} />;
  }

  return (
    <ApplicationFormClient
      existingApplication={existingApplication}
      userData={userData}
      availableRoles={availableRoles}
    />
  );
}
