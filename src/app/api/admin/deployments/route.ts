import { getAdminSession } from '@/lib/auth/admin-auth';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { createDeployment } from '@/lib/db/queries/deployments.queries';
import { createDeploymentSchema } from '@/lib/validation/schema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createDeploymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const deployment = await createDeployment({
    ...parsed.data,
    deploymentDate: new Date(parsed.data.deploymentDate),
    createdBy: admin.id,
  });

  await logActivity({
    adminId: admin.id,
    name: admin.username,
    action: 'deployment_created',
    targetId: deployment.id,
    targetLabel: deployment.title,
  });

  return NextResponse.json({ success: true, deployment });
}
