import { db } from '@/lib/db';
import {
  adminUsers,
  deploymentParticipants,
  deployments,
  hiredVolunteers,
  volunteerApplications,
} from '@/lib/db/schema';
import { DeploymentWithParticipants } from '@/types';
import { desc, eq, inArray, sql } from 'drizzle-orm';

export async function getDeployments(): Promise<DeploymentWithParticipants[]> {
  const rows = await db
    .select({
      id: deployments.id,
      title: deployments.title,
      description: deployments.description,
      deploymentDate: deployments.deploymentDate,
      createdAt: deployments.createdAt,
      createdByName: adminUsers.displayName,
      hiredVolunteerId: hiredVolunteers.id,
      participantRole: hiredVolunteers.role,
      status: hiredVolunteers.status,
      firstName: volunteerApplications.firstName,
      lastName: volunteerApplications.lastName,
      avatarUrl: volunteerApplications.photoUrl,
      contactNumber: volunteerApplications.contactNumber,
      completeAddress: volunteerApplications.completeAddress,
      barangayCode: volunteerApplications.barangayCode,
      municipalityCode: volunteerApplications.municipalityCode,
      provinceCode: volunteerApplications.provinceCode,
    })
    .from(deployments)
    .leftJoin(adminUsers, eq(adminUsers.id, deployments.createdBy))
    .leftJoin(
      deploymentParticipants,
      eq(deploymentParticipants.deploymentId, deployments.id),
    )
    .leftJoin(
      hiredVolunteers,
      eq(hiredVolunteers.id, deploymentParticipants.hiredVolunteerId),
    )
    .leftJoin(
      volunteerApplications,
      eq(volunteerApplications.id, hiredVolunteers.applicationId),
    )
    .orderBy(desc(deployments.deploymentDate));

  const byDeployment = new Map<string, DeploymentWithParticipants>();
  for (const row of rows) {
    let entry = byDeployment.get(row.id);
    if (!entry) {
      entry = {
        id: row.id,
        title: row.title,
        description: row.description,
        deploymentDate: row.deploymentDate,
        createdAt: row.createdAt,
        createdByName: row.createdByName,
        roles: [],
        participants: [],
      };
      byDeployment.set(row.id, entry);
    }
    if (
      row.hiredVolunteerId &&
      row.firstName &&
      row.lastName &&
      row.participantRole
    ) {
      entry.participants.push({
        hiredVolunteerId: row.hiredVolunteerId,
        firstName: row.firstName,
        lastName: row.lastName,
        avatarUrl: row.avatarUrl,
        role: row.participantRole,
        contactNumber: row.contactNumber,
        completeAddress: row.completeAddress,
        barangayCode: row.barangayCode,
        municipalityCode: row.municipalityCode,
        provinceCode: row.provinceCode,
        status: row.status ?? 'active',
      });
      if (!entry.roles.includes(row.participantRole)) {
        entry.roles.push(row.participantRole);
      }
    }
  }

  return Array.from(byDeployment.values());
}

export async function getDeploymentsForVolunteer(hiredVolunteerId: string) {
  return db
    .select({
      id: deployments.id,
      title: deployments.title,
      description: deployments.description,
      deploymentDate: deployments.deploymentDate,
    })
    .from(deploymentParticipants)
    .innerJoin(
      deployments,
      eq(deployments.id, deploymentParticipants.deploymentId),
    )
    .where(eq(deploymentParticipants.hiredVolunteerId, hiredVolunteerId))
    .orderBy(desc(deployments.deploymentDate));
}

export async function createDeployment(input: {
  title: string;
  description?: string;
  deploymentDate: Date;
  createdBy: number;
  volunteerIds: string[];
}) {
  return db.transaction(async (tx) => {
    const [deployment] = await tx
      .insert(deployments)
      .values({
        title: input.title,
        description: input.description,
        deploymentDate: input.deploymentDate,
        createdBy: input.createdBy,
      })
      .returning();

    if (input.volunteerIds.length > 0) {
      await tx.insert(deploymentParticipants).values(
        input.volunteerIds.map((hiredVolunteerId) => ({
          deploymentId: deployment.id,
          hiredVolunteerId,
        })),
      );

      await tx
        .update(hiredVolunteers)
        .set({
          deploymentCount: sql`coalesce(${hiredVolunteers.deploymentCount}, 0) + 1`,
        })
        .where(inArray(hiredVolunteers.id, input.volunteerIds));
    }

    return deployment;
  });
}

export async function updateDeployment(
  id: string,
  input: {
    title: string;
    description?: string;
    deploymentDate: Date;
    volunteerIds: string[];
  },
) {
  return db.transaction(async (tx) => {
    const [deployment] = await tx
      .update(deployments)
      .set({
        title: input.title,
        description: input.description,
        deploymentDate: input.deploymentDate,
      })
      .where(eq(deployments.id, id))
      .returning();

    if (!deployment) return null;

    const existing = await tx
      .select({ hiredVolunteerId: deploymentParticipants.hiredVolunteerId })
      .from(deploymentParticipants)
      .where(eq(deploymentParticipants.deploymentId, id));
    const oldVolunteerIds = existing.map((p) => p.hiredVolunteerId);

    if (oldVolunteerIds.length > 0) {
      await tx
        .update(hiredVolunteers)
        .set({
          deploymentCount: sql`greatest(coalesce(${hiredVolunteers.deploymentCount}, 0) - 1, 0)`,
        })
        .where(inArray(hiredVolunteers.id, oldVolunteerIds));
    }

    await tx
      .delete(deploymentParticipants)
      .where(eq(deploymentParticipants.deploymentId, id));

    if (input.volunteerIds.length > 0) {
      await tx.insert(deploymentParticipants).values(
        input.volunteerIds.map((hiredVolunteerId) => ({
          deploymentId: id,
          hiredVolunteerId,
        })),
      );

      await tx
        .update(hiredVolunteers)
        .set({
          deploymentCount: sql`coalesce(${hiredVolunteers.deploymentCount}, 0) + 1`,
        })
        .where(inArray(hiredVolunteers.id, input.volunteerIds));
    }

    return deployment;
  });
}

export async function deleteDeployment(id: string) {
  return db.transaction(async (tx) => {
    const participants = await tx
      .select({ hiredVolunteerId: deploymentParticipants.hiredVolunteerId })
      .from(deploymentParticipants)
      .where(eq(deploymentParticipants.deploymentId, id));
    const volunteerIds = participants.map((p) => p.hiredVolunteerId);

    await tx.delete(deployments).where(eq(deployments.id, id));

    if (volunteerIds.length > 0) {
      await tx
        .update(hiredVolunteers)
        .set({
          deploymentCount: sql`greatest(coalesce(${hiredVolunteers.deploymentCount}, 0) - 1, 0)`,
        })
        .where(inArray(hiredVolunteers.id, volunteerIds));
    }
  });
}
