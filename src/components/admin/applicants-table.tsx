'use client';

import { roleColors, roleIcons } from '@/data/admin/volunteer-role-palettes';
import { statusConfig } from '@/data/status';
import type { FullApplication } from '@/types';

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Heart,
  IdCard,
  LucideIcon,
  MapPin,
  MapPinHouse,
  Search,
  User,
  Workflow,
  X,
  XCircle,
} from 'lucide-react';

import { listBarangays, listMuncities, listProvinces } from '@/lib/psgc';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ShieldSpinLoader } from '../custom/loading';

const STATUS_TABS = ['all', 'pending', 'under_review', 'rejected'] as const;

type StatusTab = (typeof STATUS_TABS)[number];

type ApplicantAction = 'approve' | 'reject' | 'under_review';

export function ApplicantsTable({
  applicants,
  counts,
  currentStatus,
}: {
  applicants: FullApplication[];
  counts: Record<string, number>;
  currentStatus: string;
}) {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FullApplication | null>(null);
  const [rejectModal, setRejectModal] = useState<FullApplication | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState<ApplicantAction | null>(
    null,
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return applicants;
    }
    return applicants.filter((applicant) => {
      const searchable = [
        applicant.firstName,
        applicant.middleName,
        applicant.lastName,
        applicant.email,
        applicant.contactNumber,
        applicant.applicationStatus,
        applicant.primaryRole,
        applicant.secondaryRole,
        applicant.provinceCode,
        applicant.municipalityCode,
        applicant.barangayCode,
        applicant.employmentStatus,
        applicant.position,
        applicant.employer,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const statusLabel =
        statusConfig[
          applicant.applicationStatus as keyof typeof statusConfig
        ]?.label?.toLowerCase() ?? '';

      return searchable.includes(query) || statusLabel.includes(query);
    });
  }, [applicants, search]);

  const handleAction = async (
    applicantId: string,
    action: ApplicantAction,
    notes?: string,
  ) => {
    if (action === 'reject' && !notes?.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setLoadingAction(action);
    try {
      const response = await fetch(`/api/admin/applicants/${applicantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes,
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(json?.error ?? 'Action failed. Please try again.');
        return;
      }
      if (action === 'approve') {
        toast.success('Application approved & volunteer hired!');
      } else if (action === 'reject') {
        toast.success('Application rejected.');
      } else {
        toast.success('Application marked as under review.');
      }

      setSelected(null);
      setRejectModal(null);
      setRejectNotes('');
      router.refresh();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const selectedRole = selected?.primaryRole;
  const SelectedRoleIcon = selectedRole ? roleIcons[selectedRole] : undefined;
  const selectedRoleColor = selectedRole
    ? roleColors[selectedRole]
    : 'bg-gray-100 text-gray-600';
  const selectedStatus = selected
    ? statusConfig[selected.applicationStatus as keyof typeof statusConfig]
    : null;

  const province = listProvinces().find(
    (province) => province.psgcCode === selected?.provinceCode,
  );

  const municipality = listMuncities().find(
    (municipality) => municipality.psgcCode === selected?.municipalityCode,
  );

  const barangay = listBarangays().find(
    (barangay) => barangay.psgcCode === selected?.barangayCode,
  );

  return (
    <div className="mx-auto w-full space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Review and manage volunteer applications
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              const url = new URL(window.location.href);
              if (tab === 'all') {
                url.searchParams.delete('status');
              } else {
                url.searchParams.set('status', tab);
              }
              router.push(`${url.pathname}${url.search}`);
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              currentStatus === tab
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {formatStatusLabel(tab)}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                currentStatus === tab
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {counts[tab] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search applicants by name, role, address, employer..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-237.5">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[
                  'Applicant',
                  'Contact',
                  'Applied Date',
                  'Status',
                  'Documents',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    No applicants found.
                  </td>
                </tr>
              ) : (
                filtered.map((applicant) => {
                  const config =
                    statusConfig[
                      applicant.applicationStatus as keyof typeof statusConfig
                    ];
                  const province = listProvinces().find(
                    (province) => province.psgcCode === applicant?.provinceCode,
                  );

                  const municipality = listMuncities().find(
                    (municipality) =>
                      municipality.psgcCode === applicant?.municipalityCode,
                  );

                  return (
                    <tr
                      key={applicant.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50">
                            {applicant.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={applicant.photoUrl}
                                alt={`${applicant.firstName} ${applicant.lastName}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-orange-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-900">
                              {applicant.firstName}{' '}
                              {applicant.middleName
                                ? `${applicant.middleName.charAt(0)}. `
                                : ''}
                              {applicant.lastName}
                            </div>

                            <div className="mt-0.5 truncate text-xs text-gray-400">
                              {applicant.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {applicant.contactNumber}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-400">
                          {municipality?.munCityName}, {province?.provName}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {applicant.submittedAt
                            ? new Date(
                                applicant.submittedAt,
                              ).toLocaleDateString('en-PH', {
                                dateStyle: 'long',
                              })
                            : '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config?.class}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${config?.dot}`}
                          />

                          {config?.label}
                        </span>
                      </td>

                      <td className="max-w-60 px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <DocumentBadge
                            label="Valid ID"
                            complete={Boolean(
                              applicant.validIdFrontUrl &&
                              applicant.validIdBackUrl,
                            )}
                          />

                          <DocumentBadge
                            label="Training"
                            complete={Boolean(
                              applicant.trainingCertUrl?.length,
                            )}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(applicant)}
                          className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-500 hover:cursor-pointer transition-colors hover:bg-orange-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <span className="text-sm text-gray-500">
            Showing {filtered.length} of {applicants.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border border-gray-200 hover:cursor-pointer p-2 text-gray-500 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
              1
            </span>

            <button
              type="button"
              disabled
              className="rounded-lg border border-gray-200 hover:cursor-pointer p-2 text-gray-500 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50">
                  {selected.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.photoUrl}
                      alt={`${selected.firstName} ${selected.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-orange-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-gray-900">
                    {selected.firstName}{' '}
                    {selected.middleName
                      ? `${selected.middleName.charAt(0)}. `
                      : ''}
                    {selected.lastName}
                  </h1>

                  <p className="text-xs text-gray-500">
                    Volunteer Application ·{' '}
                    {selected.submittedAt
                      ? new Date(selected.submittedAt).toLocaleDateString(
                          'en-PH',
                          {
                            dateStyle: 'long',
                          },
                        )
                      : 'Not submitted'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedStatus && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedStatus.class}`}
                  >
                    {selectedStatus.label}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <DetailSection title="Personal Information" icon={User}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      Primary Prepared Role
                    </p>
                    <div
                      className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${selectedRoleColor}`}
                    >
                      {SelectedRoleIcon && (
                        <SelectedRoleIcon className="h-4 w-4" />
                      )}
                      {selected.primaryRole}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">
                      Secondary Prepared Role
                    </p>
                    <div className="mt-1 inline-flex rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                      {selected.secondaryRole || '—'}
                    </div>
                  </div>
                </div>

                <DetailGrid
                  items={[
                    {
                      label: 'Gender',
                      value: selected.gender,
                    },
                    {
                      label: 'Age',
                      value: `${selected.age} years old`,
                    },
                    {
                      label: 'Date of Birth',
                      value: selected.dateOfBirth,
                    },
                    {
                      label: 'Nationality',
                      value: selected.nationality,
                    },
                    {
                      label: 'Native Language',
                      value: selected.nativePlace,
                    },
                    {
                      label: 'Education Level',
                      value: selected.educationLevel,
                    },

                    {
                      label: 'Marital Status',
                      value: selected.maritalStatus,
                    },
                    {
                      label: 'Employment Status',
                      value: selected.employmentStatus,
                    },
                  ]}
                />
              </DetailSection>

              {selected.employmentStatus === 'Employed' && (
                <DetailSection title="Employment" icon={Workflow}>
                  <DetailGrid
                    items={[
                      {
                        label: 'Nature of Employment',
                        value: selected.natureOfEmployment,
                      },
                      {
                        label: 'Position',
                        value: selected.position,
                      },
                      {
                        label: 'Employer',
                        value: selected.employer,
                      },
                    ]}
                  />
                </DetailSection>
              )}

              <DetailSection title="Identification" icon={IdCard}>
                <DetailGrid
                  columns={2}
                  items={[
                    {
                      label: 'ID Number',
                      value: selected.idNumber,
                      mono: true,
                    },
                    {
                      label: 'ID Card Type',
                      value: selected.idCardType,
                    },
                  ]}
                />
              </DetailSection>

              <DetailSection title="Contact & Address" icon={MapPinHouse}>
                <div className="space-y-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      Complete Address
                    </div>

                    <div className="text-sm font-semibold text-gray-800">
                      {selected.completeAddress}
                    </div>
                  </div>

                  <DetailGrid
                    items={[
                      {
                        label: 'Province',
                        value: province?.provName,
                      },
                      {
                        label: 'Municipality / City',
                        value: municipality?.munCityName,
                      },
                      {
                        label: 'Barangay',
                        value: barangay?.brgyName,
                      },
                      {
                        label: 'Contact Number',
                        value: selected.contactNumber,
                      },
                      {
                        label: 'Home Phone',
                        value: selected.homePhone,
                      },
                      {
                        label: 'Email Address',
                        value: selected.email,
                      },
                    ]}
                  />
                </div>
              </DetailSection>

              <DetailSection title="Emergency Contact" icon={Heart}>
                <DetailGrid
                  columns={2}
                  items={[
                    {
                      label: 'Name',
                      value: selected.emergencyContact?.name,
                    },
                    {
                      label: 'Relation',
                      value: selected.emergencyContact?.relation,
                    },
                    {
                      label: 'Contact Number',
                      value: selected.emergencyContact?.contactNumber,
                    },
                    {
                      label: 'Address',
                      value: selected.emergencyContact?.address,
                    },
                  ]}
                />
              </DetailSection>

              <DetailSection title="Experience" icon={Workflow}>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-1 text-xs text-gray-400">
                    Volunteering Experience
                  </p>

                  <p className="whitespace-pre-line text-sm font-medium text-gray-800">
                    {selected.volunteeringExperience ||
                      'No volunteering experience provided.'}
                  </p>
                </div>
              </DetailSection>

              <DetailSection title="Submitted Documents" icon={FileText}>
                <DocumentReview
                  docs={{
                    validIdFrontUrl: selected.validIdFrontUrl,
                    validIdBackUrl: selected.validIdBackUrl,
                    trainingCertUrls: selected.trainingCertUrl,
                  }}
                />
              </DetailSection>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between rounded-b-lg border-t border-gray-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Close
              </button>

              {selected.applicationStatus !== 'approved' &&
                selected.applicationStatus !== 'rejected' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction(selected.id, 'under_review')}
                      disabled={loadingAction !== null}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-500 transition-colors hover:cursor-pointer hover:bg-blue-100 disabled:opacity-50"
                    >
                      {loadingAction === 'under_review' ? (
                        <ShieldSpinLoader size={18} color="text-blue-500" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      Under Review
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRejectModal(selected);

                        setSelected(null);
                      }}
                      disabled={loadingAction !== null}
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:cursor-pointer hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(selected.id, 'approve')}
                      disabled={loadingAction !== null}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:cursor-pointer shadow-green-200 transition-colors hover:bg-green-600 disabled:opacity-50"
                    >
                      {loadingAction === 'approve' ? (
                        <ShieldSpinLoader size={18} color="text-white" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-bold text-gray-900">Reject Application</h2>

              <p className="mt-0.5 text-sm text-gray-500">
                {rejectModal.firstName} {rejectModal.lastName}
              </p>
            </div>

            <div className="p-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Reason for rejection <span className="text-red-500">*</span>
              </label>

              <textarea
                value={rejectNotes}
                onChange={(event) => setRejectNotes(event.target.value)}
                rows={5}
                placeholder="Explain why the application is being rejected. This will be included in the notification email."
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);

                  setRejectNotes('');
                }}
                className="rounded-lg bg-gray-100 px-4 hover:cursor-pointer py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAction(rejectModal.id, 'reject', rejectNotes)
                }
                disabled={loadingAction !== null || !rejectNotes.trim()}
                className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingAction === 'reject' ? (
                  <ShieldSpinLoader size={18} color="text-white" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatStatusLabel(status: StatusTab) {
  if (status === 'all') {
    return 'All';
  }
  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function DocumentBadge({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-medium ${
        complete ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {complete ? label : `${label} missing`}
    </span>
  );
}

type DetailSectionProps = {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

function DetailSection({ title, icon: Icon, children }: DetailSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
          <Icon className="h-3.5 w-3.5 text-orange-500" />
        </div>

        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

type DetailGridProps = {
  items: {
    label: string;
    value: string | number | null | undefined;
    mono?: boolean;
  }[];

  columns?: 2 | 3 | 4;
};

function DetailGrid({ items, columns = 3 }: DetailGridProps) {
  const gridClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-4'
        : 'sm:grid-cols-3';

  return (
    <div className={`grid grid-cols-2 gap-3 ${gridClass}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-gray-50 p-3">
          <div className="mb-0.5 text-xs text-gray-400">{item.label}</div>

          <div
            className={`wrap-break-word text-sm font-semibold text-gray-800 ${
              item.mono ? 'font-mono' : ''
            }`}
          >
            {item.value || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DocumentSet {
  validIdFrontUrl?: string | null;
  validIdBackUrl?: string | null;
  trainingCertUrls?: string[] | null;
}

function isImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(url);
}
type DocumentThumbProps = {
  url: string;
  label?: string;
};
function DocumentThumb({ url, label }: DocumentThumbProps) {
  const isImage = isImageUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-orange-300"
    >
      <div className="relative aspect-4/3 w-full bg-gray-100">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label ?? 'Document'}
            className="h-24 w-full object-cover"
          />
        ) : (
          <div className="flex h-24 flex-col items-center justify-center gap-1.5 bg-gray-50">
            <FileText className="h-6 w-6 text-gray-400" />

            <span className="text-xs font-medium text-gray-500">
              PDF Document
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-900">
            <ExternalLink className="h-3.5 w-3.5" />
            View full size
          </span>
        </div>
      </div>

      {label && (
        <div className="border-t border-gray-100 px-2.5 py-1.5 text-center text-xs font-medium text-gray-600">
          {label}
        </div>
      )}
    </a>
  );
}

interface CategoryProps {
  icon: LucideIcon;
  title: string;
  emptyText: string;
  documents: {
    url: string;
    label: string;
  }[];
}

function DocumentCategory({
  icon: Icon,
  title,
  emptyText,
  documents,
}: CategoryProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-500" />

        <span className="text-sm font-bold text-gray-900">{title}</span>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {documents.map((document) => (
            <DocumentThumb
              key={document.url}
              url={document.url}
              label={document.label}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">{emptyText}</p>
      )}
    </div>
  );
}

export function DocumentReview({ docs }: { docs: DocumentSet }) {
  const trainingCerts = docs.trainingCertUrls ?? [];

  return (
    <div className="space-y-4">
      <DocumentCategory
        icon={IdCard}
        title="Valid Government ID"
        emptyText="No ID on file."
        documents={[
          ...(docs.validIdFrontUrl
            ? [
                {
                  url: docs.validIdFrontUrl,
                  label: 'Front',
                },
              ]
            : []),

          ...(docs.validIdBackUrl
            ? [
                {
                  url: docs.validIdBackUrl,
                  label: 'Back',
                },
              ]
            : []),
        ]}
      />

      <DocumentCategory
        icon={FileText}
        title={`Training Certificate${
          trainingCerts.length === 1 ? '' : 's'
        } (${trainingCerts.length})`}
        emptyText="No training certificates on file."
        documents={trainingCerts.map((url, index) => ({
          url,
          label: `Certificate ${index + 1}`,
        }))}
      />
    </div>
  );
}
