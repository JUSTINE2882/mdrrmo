import { getAdminSession } from '@/lib/auth/admin-auth';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import {
  deleteRoleSlot,
  updateRoleSlot,
} from '@/lib/db/queries/role-slots.queries';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateSchema = z.object({
  capacity: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const slot = await updateRoleSlot(id, parsed.data);
  if (!slot)
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });

  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'role_slot_updated',
    targetId: slot.id,
    targetLabel: slot.name,
    details: parsed.data,
  });

  return NextResponse.json({ success: true, slot });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await deleteRoleSlot(id);

  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'role_slot_deleted',
    targetId: id,
  });

  return NextResponse.json({ success: true });
}
