import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { volunteerApplications, volunteerProfiles } from '@/lib/db/schema';
import { sendApplicationReceivedEmail } from '@/lib/email/resend';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  applicationDraftSchema,
  fullApplicationSchema,
} from '@/lib/validation/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const mode = body?.status === 'draft' ? 'draft' : 'submit';

    if (mode === 'draft') {
      const parsed = applicationDraftSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Draft validation failed',
            issues: parsed.error.flatten(),
          },
          { status: 400 },
        );
      }

      const data = parsed.data;
      const existing = await db
        .select({
          id: volunteerApplications.id,
          status: volunteerApplications.applicationStatus,
        })
        .from(volunteerApplications)
        .where(eq(volunteerApplications.volunteerId, user.id))
        .limit(1)
        .then((rows) => rows[0] ?? null);

      if (existing) {
        if (existing.status !== 'draft') {
          return NextResponse.json(
            {
              error: 'You already have a submitted application.',
            },
            { status: 409 },
          );
        }

        const emergencyContact =
          data.emergencyName ||
          data.emergencyRelation ||
          data.emergencyContact ||
          data.emergencyAddress
            ? {
                name: data.emergencyName ?? '',
                relation: data.emergencyRelation ?? '',
                contactNumber: data.emergencyContact ?? '',
                address: data.emergencyAddress ?? '',
              }
            : null;

        await db
          .update(volunteerApplications)
          .set({
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            gender: data.gender,
            age: data.age,
            dateOfBirth: data.dateOfBirth,
            nationality: data.nationality,
            nativePlace: data.nativePlace,
            educationLevel: data.educationLevel,
            maritalStatus: data.maritalStatus,
            employmentStatus: data.employmentStatus,
            natureOfEmployment: data.natureOfEmployment || null,
            position: data.position || null,
            employer: data.employer || null,
            primaryRole: data.primaryRole,
            secondaryRole: data.secondaryRole,
            idNumber: data.idNumber,
            idCardType: data.idCardType,
            completeAddress: data.completeAddress,
            provinceCode: data.provinceCode,
            municipalityCode: data.municipalityCode,
            barangayCode: data.barangayCode,
            contactNumber: data.contactNumber,
            homePhone: data.homePhone || null,
            email: data.email,
            emergencyContact,
            volunteeringExperience: data.volunteeringExperience || null,
            validIdFrontUrl: data.validIdFrontUrl || null,
            validIdBackUrl: data.validIdBackUrl || null,
            trainingCertUrl: data.trainingCertUrls ?? [],
            photoUrl: data.photoUrl || null,
            updatedAt: new Date(),
          })
          .where(eq(volunteerApplications.id, existing.id));

        return NextResponse.json({
          success: true,
          applicationId: existing.id,
          status: 'draft',
        });
      }

      const [application] = await db
        .insert(volunteerApplications)
        .values({
          volunteerId: user.id,
          firstName: data.firstName ?? '',
          middleName: data.middleName ?? '',
          lastName: data.lastName ?? '',
          gender: data.gender ?? 'Male',
          age: data.age ?? 18,
          dateOfBirth: data.dateOfBirth ?? '',
          nationality: data.nationality ?? 'Filipino',
          nativePlace: data.nativePlace ?? '',
          educationLevel: data.educationLevel ?? '',
          maritalStatus: data.maritalStatus ?? 'Single',
          employmentStatus: data.employmentStatus ?? 'Unemployed',
          natureOfEmployment: data.natureOfEmployment?.trim() || null,
          position: data.position?.trim() || null,
          employer: data.employer?.trim() || null,
          primaryRole: data.primaryRole ?? '',
          secondaryRole: data.secondaryRole ?? '',
          idNumber: data.idNumber ?? '',
          idCardType: data.idCardType ?? '',
          completeAddress: data.completeAddress ?? '',
          provinceCode: data.provinceCode ?? '',
          municipalityCode: data.municipalityCode ?? '',
          barangayCode: data.barangayCode ?? '',
          contactNumber: data.contactNumber ?? '',
          homePhone: data.homePhone?.trim() || null,
          email: data.email ?? user.email ?? '',
          emergencyContact: data.emergencyName
            ? {
                name: data.emergencyName,
                relation: data.emergencyRelation ?? '',
                contactNumber: data.emergencyContact ?? '',
                address: data.emergencyAddress ?? '',
              }
            : null,
          volunteeringExperience: data.volunteeringExperience?.trim() || null,
          validIdFrontUrl: data.validIdFrontUrl ?? null,
          validIdBackUrl: data.validIdBackUrl ?? null,
          trainingCertUrl: data.trainingCertUrls ?? [],
          photoUrl: data.photoUrl ?? null,
          applicationStatus: 'draft',
          submittedAt: null,
          updatedAt: new Date(),
        })
        .returning({
          id: volunteerApplications.id,
        });

      return NextResponse.json({
        success: true,
        applicationId: application.id,
        status: 'draft',
      });
    }

    const parsed = fullApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const existing = await db
      .select()
      .from(volunteerApplications)
      .where(eq(volunteerApplications.volunteerId, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (existing && existing.applicationStatus !== 'draft') {
      return NextResponse.json(
        {
          error: 'You have already submitted an application.',
        },
        { status: 409 },
      );
    }

    let applicationId: string;

    if (existing) {
      await db
        .update(volunteerApplications)
        .set({
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          age: data.age,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          nativePlace: data.nativePlace,
          educationLevel: data.educationLevel,
          maritalStatus: data.maritalStatus,
          employmentStatus: data.employmentStatus,
          natureOfEmployment: data.natureOfEmployment || null,
          position: data.position || null,
          employer: data.employer || null,
          primaryRole: data.primaryRole,
          secondaryRole: data.secondaryRole,
          idNumber: data.idNumber,
          idCardType: data.idCardType,
          completeAddress: data.completeAddress,
          provinceCode: data.provinceCode,
          municipalityCode: data.municipalityCode,
          barangayCode: data.barangayCode,
          contactNumber: data.contactNumber,
          homePhone: data.homePhone || null,
          email: data.email,
          emergencyContact: {
            name: data.emergencyName,
            relation: data.emergencyRelation,
            contactNumber: data.emergencyContact,
            address: data.emergencyAddress,
          },
          volunteeringExperience: data.volunteeringExperience || null,
          validIdFrontUrl: data.validIdFrontUrl,
          validIdBackUrl: data.validIdBackUrl,
          trainingCertUrl: data.trainingCertUrls,
          photoUrl: data.photoUrl,
          applicationStatus: 'pending',
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(volunteerApplications.id, existing.id));

      applicationId = existing.id;
    } else {
      const [application] = await db
        .insert(volunteerApplications)
        .values({
          volunteerId: user.id,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          age: data.age,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          nativePlace: data.nativePlace,
          educationLevel: data.educationLevel,
          maritalStatus: data.maritalStatus,
          employmentStatus: data.employmentStatus,
          natureOfEmployment: data.natureOfEmployment || null,
          position: data.position || null,
          employer: data.employer || null,
          primaryRole: data.primaryRole,
          secondaryRole: data.secondaryRole,
          idNumber: data.idNumber,
          idCardType: data.idCardType,
          completeAddress: data.completeAddress,
          provinceCode: data.provinceCode,
          municipalityCode: data.municipalityCode,
          barangayCode: data.barangayCode,
          contactNumber: data.contactNumber,
          homePhone: data.homePhone || null,
          email: data.email,
          emergencyContact: {
            name: data.emergencyName,
            relation: data.emergencyRelation,
            contactNumber: data.emergencyContact,
            address: data.emergencyAddress,
          },
          volunteeringExperience: data.volunteeringExperience || null,
          validIdFrontUrl: data.validIdFrontUrl,
          validIdBackUrl: data.validIdBackUrl,
          trainingCertUrl: data.trainingCertUrls,
          photoUrl: data.photoUrl,
          applicationStatus: 'pending',
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({
          id: volunteerApplications.id,
        });
      applicationId = application.id;
    }

    const profile = await db
      .select({
        firstName: volunteerProfiles.firstName,
        lastName: volunteerProfiles.lastName,
      })
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.id, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (user.email) {
      await sendApplicationReceivedEmail(
        user.email,
        profile?.firstName ?? data.firstName ?? 'Volunteer',
        applicationId,
      ).catch((error) => {
        console.error('Email send error:', error);
      });

      await logActivity({
        adminId: 1,
        name: `${profile.firstName} ${profile.lastName}`,
        action: 'new_pending_volunteer_applicant',
      });
    }

    return NextResponse.json({
      success: true,
      applicationId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Application submit error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const application = await db
      .select()
      .from(volunteerApplications)
      .where(eq(volunteerApplications.volunteerId, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    return NextResponse.json({
      application,
    });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
