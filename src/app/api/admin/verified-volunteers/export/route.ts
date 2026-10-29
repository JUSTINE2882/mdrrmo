import { getAdminSession } from '@/lib/auth/admin-auth';
import { logActivity } from '@/lib/db/queries/activity-logs.queries';
import { getVerifiedVolunteers } from '@/lib/db/queries/verified-volunteers.queries';
import { listBarangays, listMuncities, listProvinces } from '@/lib/psgc';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const volunteers = await getVerifiedVolunteers();

    const provinceMap = new Map(
      listProvinces().map((p) => [p.psgcCode, p.provName]),
    );
    const muncityMap = new Map(
      listMuncities().map((m) => [m.psgcCode, m.munCityName]),
    );
    const barangayMap = new Map(
      listBarangays().map((b) => [b.psgcCode, b.brgyName]),
    );

    const resolveAddress = (v: (typeof volunteers)[number]) =>
      [
        v.completeAddress,
        v.barangayCode ? barangayMap.get(v.barangayCode) : null,
        v.municipalityCode ? muncityMap.get(v.municipalityCode) : null,
        v.provinceCode ? provinceMap.get(v.provinceCode) : null,
      ]
        .filter(Boolean)
        .join(', ');

    const headers = [
      'ID',
      'First Name',
      'Middle Name',
      'Last Name',
      'Role',
      'Status',
      'Email',
      'Contact Number',
      'Address',
      'Verified Date',
      'Deployments',
    ];

    const rows = volunteers.map((v) => [
      v.id,
      v.firstName ?? '',
      v.middleName ?? '',
      v.lastName ?? '',
      v.role ?? '',
      v.status,
      v.email ?? '',
      v.contactNumber ?? '',
      resolveAddress(v) || '',
      v.hiredAt ? new Date(v.hiredAt).toISOString().slice(0, 10) : '',
      v.deploymentCount ?? 0,
    ]);

    const csv =
      '\ufeff' +
      [headers, ...rows]
        .map((row) => row.map(csvEscape).join(','))
        .join('\r\n');

    await logActivity({
      adminId: admin.id,
      name: admin.username,
      action: 'volunteers_exported',
      details: { count: volunteers.length },
    });

    const filename = `mdrrmo-verified-volunteers-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store', // never let a PII export be cached
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Export failed. Please try again.' },
      { status: 500 },
    );
  }
}
