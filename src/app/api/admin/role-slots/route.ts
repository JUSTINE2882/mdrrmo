import { getAdminSession } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { createRoleSlot } from '@/lib/db/queries/role-slots.queries';
import { volunteerRoleSlots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createRoleSlotSchema = z.object({
  name: z.string().min(3, 'Role name is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
});

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createRoleSlotSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const existingRole = await db
    .select()
    .from(volunteerRoleSlots)
    .where(eq(volunteerRoleSlots.name, parsed.data.name))
    .limit(1);

  if (existingRole.length > 0) {
    return NextResponse.json(
      { error: 'This role already exist.' },
      { status: 500 },
    );
  }

  const slot = await createRoleSlot({ ...parsed.data, createdBy: admin.id });

  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'role_slot_created',
    targetId: slot.id,
    targetLabel: slot.name,
    details: { capacity: slot.capacity },
  });

  return NextResponse.json({ success: true, slot });
}
