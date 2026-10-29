import { markNotificationRead } from '@/lib/db/queries/notifications.queries';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await markNotificationRead(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
