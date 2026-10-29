import { VerifiedVolunteersClient } from '@/components/admin/verified-volunteers-client';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { hiredVolunteers, volunteerApplications } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function HiredVolunteersPage() {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  const rows = await db
    .select({
      id: hiredVolunteers.id,
      avatar: volunteerApplications.photoUrl,
      role: hiredVolunteers.role,
      status: hiredVolunteers.status,
      hiredAt: hiredVolunteers.hiredAt,
      deploymentCount: hiredVolunteers.deploymentCount,
      trainings: hiredVolunteers.trainings,
      firstName: volunteerApplications.firstName,
      middleName: volunteerApplications.middleName,
      lastName: volunteerApplications.lastName,
      email: volunteerApplications.email,
      contactNumber: volunteerApplications.contactNumber,
      completeAddress: volunteerApplications.completeAddress,
      barangayCode: volunteerApplications.barangayCode,
      municipalityCode: volunteerApplications.municipalityCode,
      provinceCode: volunteerApplications.provinceCode,
    })
    .from(hiredVolunteers)
    .leftJoin(
      volunteerApplications,
      eq(hiredVolunteers.volunteerId, volunteerApplications.volunteerId),
    )
    .orderBy(desc(hiredVolunteers.hiredAt));

  return (
    <div className="w-full mb-0">
      <VerifiedVolunteersClient volunteers={rows} />
    </div>
  );
}
