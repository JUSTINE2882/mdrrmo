import { db } from '@/lib/db';
import {
  deploymentParticipants,
  hiredVolunteers,
  volunteerApplications,
  volunteerRoleSlots,
} from '@/lib/db/schema';
import { RoleSlot } from '@/types';
import { and, count, eq } from 'drizzle-orm';

export async function getRoleSlotsWithApplicants(): Promise<RoleSlot[]> {
  const slots = await db.select().from(volunteerRoleSlots);

  const [volunteerRows] = await Promise.all([
    db
      .select({
        role: hiredVolunteers.role,
        hiredVolunteerId: hiredVolunteers.id,
        status: hiredVolunteers.status,
        hiredAt: hiredVolunteers.hiredAt,
        deploymentCount: hiredVolunteers.deploymentCount,
        firstName: volunteerApplications.firstName,
        lastName: volunteerApplications.lastName,
        email: volunteerApplications.email,
        avatarUrl: volunteerApplications.photoUrl,
        contactNumber: volunteerApplications.contactNumber,
        completeAddress: volunteerApplications.completeAddress,
        secondaryRole: volunteerApplications.secondaryRole,
      })
      .from(hiredVolunteers)
      .leftJoin(
        volunteerApplications,
        and(
          eq(volunteerApplications.volunteerId, hiredVolunteers.volunteerId),
          eq(volunteerApplications.applicationStatus, 'approved'),
        ),
      )
      .where(eq(hiredVolunteers.status, 'active')),

    db
      .select({
        hiredVolunteerId: deploymentParticipants.hiredVolunteerId,
        total: count(),
      })
      .from(deploymentParticipants)
      .groupBy(deploymentParticipants.hiredVolunteerId),
  ]);

  const byRole = new Map<string, RoleSlot['volunteers']>();
  for (const row of volunteerRows) {
    const list = byRole.get(row.role) ?? [];
    list.push({
      hiredVolunteerId: row.hiredVolunteerId,
      firstName: row.firstName ?? '',
      lastName: row.lastName ?? '',
      email: row.email,
      avatarUrl: row.avatarUrl,
      contactNumber: row.contactNumber,
      completeAddress: row.completeAddress,
      secondaryRole: row.secondaryRole,
      status: row.status,
      hiredAt: row.hiredAt,
      deploymentCount: row.deploymentCount ?? 0,
    });
    byRole.set(row.role, list);
  }

  return slots.map((slot) => {
    const volunteers = byRole.get(slot.name) ?? [];
    return {
      id: slot.id,
      name: slot.name,
      capacity: slot.capacity,
      isActive: slot.isActive,
      filledCount: volunteers.length,
      isFull: volunteers.length >= slot.capacity,
      volunteers,
    };
  });
}

export async function createRoleSlot(input: {
  name: string;
  capacity: number;
  createdBy: number;
}) {
  const [slot] = await db.insert(volunteerRoleSlots).values(input).returning();
  return slot;
}

export async function updateRoleSlot(
  id: string,
  input: { capacity?: number; isActive?: boolean },
) {
  const [slot] = await db
    .update(volunteerRoleSlots)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(volunteerRoleSlots.id, id))
    .returning();
  return slot ?? null;
}

export async function deleteRoleSlot(id: string) {
  await db.delete(volunteerRoleSlots).where(eq(volunteerRoleSlots.id, id));
}

export async function getAvailableRolesForApplicants(): Promise<string[]> {
  const rows = await getRoleSlotsWithApplicants();
  return rows.filter((r) => r.isActive && !r.isFull).map((r) => r.name);
}

export async function findAvailableRole(
  primaryRole: string,
  secondaryRole: string,
): Promise<{ assignedRole: string; usedFallback: boolean } | null> {
  const slots = await getRoleSlotsWithApplicants();
  const bySlotName = new Map(slots.map((s) => [s.name, s]));

  const primarySlot = bySlotName.get(primaryRole);
  if (primarySlot && !primarySlot.isFull) {
    return { assignedRole: primaryRole, usedFallback: false };
  }

  const secondarySlot = bySlotName.get(secondaryRole);
  if (secondarySlot && !secondarySlot.isFull) {
    return { assignedRole: secondaryRole, usedFallback: true };
  }

  return null;
}
