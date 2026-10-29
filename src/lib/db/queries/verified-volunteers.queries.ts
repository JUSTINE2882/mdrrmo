import { desc, eq } from 'drizzle-orm';
import { db } from '..';
import { hiredVolunteers, volunteerApplications } from '../schema';

export async function getVerifiedVolunteers() {
  const rows = await db
    .select({
      id: hiredVolunteers.id,
      role: hiredVolunteers.role,
      status: hiredVolunteers.status,
      firstName: volunteerApplications.firstName,
      middleName: volunteerApplications.middleName,
      lastName: volunteerApplications.lastName,
      email: volunteerApplications.email,
      avatarUrl: volunteerApplications.photoUrl,
      contactNumber: volunteerApplications.contactNumber,
      hiredAt: hiredVolunteers.hiredAt,
      completeAddress: volunteerApplications.completeAddress,
      barangayCode: volunteerApplications.barangayCode,
      deploymentCount: hiredVolunteers.deploymentCount,
      municipalityCode: volunteerApplications.municipalityCode,
      provinceCode: volunteerApplications.provinceCode,
    })
    .from(hiredVolunteers)
    .leftJoin(
      volunteerApplications,
      eq(volunteerApplications.id, hiredVolunteers.applicationId),
    )
    .orderBy(desc(hiredVolunteers.hiredAt));
  return rows;
}
