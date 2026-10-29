import { getAdminSession } from '@/lib/auth/admin-auth';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import {
  deleteDeployment,
  updateDeployment,
} from '@/lib/db/queries/deployments.queries';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateDeploymentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  deploymentDate: z.string().min(1, 'Date is required'),
  volunteerIds: z.array(z.string()).min(1, 'Select at least one volunteer'),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const parsed = updateDeploymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const deployment = await updateDeployment(id, {
    ...parsed.data,
    deploymentDate: new Date(parsed.data.deploymentDate),
  });
  if (!deployment)
    return NextResponse.json(
      { error: 'Deployment not found' },
      { status: 404 },
    );

  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'deployment_updated',
    targetType: 'deployment',
    targetId: deployment.id,
    targetLabel: deployment.title,
  });

  return NextResponse.json({ success: true, deployment });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await deleteDeployment(id);

  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'deployment_deleted',
    targetType: 'deployment',
    targetId: id,
  });

  return NextResponse.json({ success: true });
}
