'use client';

import { DatePicker } from '@/components/custom/date-picker';
import { ShieldSpinLoader } from '@/components/custom/loading';
import { VolunteerAvatar } from '@/components/custom/volunteer-avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUGGESTED_ROLES } from '@/data/admin/records';
import { listBarangays, listMuncities, listProvinces } from '@/lib/psgc';
import { DeploymentWithParticipants, RoleSlot, RoleVolunteer } from '@/types';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  Trash2,
  Truck,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../custom/confirmation-dialog';

const ALL_ROLES = '__all__';
const PARTICIPANT_PREVIEW_LIMIT = 5;

function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function RecordsClient({
  roleSlots,
  deployments,
}: {
  roleSlots: RoleSlot[];
  deployments: DeploymentWithParticipants[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'roles' | 'deployments' | 'reports'>('roles');

  return (
    <div className="mx-auto w-full pb-20 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Records</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Approved, active volunteers by role, deployment history, and
          consolidated reports
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 print:hidden">
        <button
          onClick={() => setTab('roles')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:cursor-pointer ${tab === 'roles' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Users className="h-4 w-4" /> Role Availability
        </button>
        <button
          onClick={() => setTab('deployments')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:cursor-pointer ${tab === 'deployments' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Truck className="h-4 w-4" /> Deployments
        </button>
        <button
          onClick={() => setTab('reports')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:cursor-pointer ${tab === 'reports' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Download className="h-4 w-4" /> Reports
        </button>
      </div>
      {tab === 'roles' && (
        <RoleSlotsPanel
          roleSlots={roleSlots}
          onChanged={() => router.refresh()}
        />
      )}
      {tab === 'deployments' && (
        <DeploymentsPanel
          deployments={deployments}
          roleSlots={roleSlots}
          onChanged={() => router.refresh()}
        />
      )}
      {tab === 'reports' && (
        <ReportsPanel roleSlots={roleSlots} deployments={deployments} />
      )}
    </div>
  );
}

function RoleSlotsPanel({
  roleSlots,
  onChanged,
}: {
  roleSlots: RoleSlot[];
  onChanged: () => void;
}) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [viewTarget, setViewTarget] = useState<{
    volunteer: RoleVolunteer;
    roleName: string;
  } | null>(null);

  const filteredSlots = useMemo(
    () =>
      roleSlots.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [roleSlots, search],
  );
  const totals = useMemo(
    () => ({
      roles: roleSlots.length,
      approvedActive: roleSlots.reduce((sum, s) => sum + s.filledCount, 0),
      capacity: roleSlots.reduce((sum, s) => sum + s.capacity, 0),
    }),
    [roleSlots],
  );

  const toggleExpanded = (id: string) =>
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openAdd = () => {
    setName('');
    setCapacity('10');
    setShowAdd(true);
  };
  const openEdit = (slot: RoleSlot) => {
    setCapacity(String(slot.capacity));
    setEditTarget(slot);
  };

  const submitAdd = async () => {
    if (!name.trim()) {
      toast.error('Role name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/role-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), capacity: Number(capacity) }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? 'Failed to add role');
        setShowAdd(false);
        return;
      }
      toast.success('Role added successfully.');
      setShowAdd(false);
      onChanged();
    } finally {
      setSaving(false);
      setShowAdd(false);
    }
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/role-slots/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: Number(capacity) }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? 'Failed to update role');
        return;
      }
      toast.success('Role updated.');
      setEditTarget(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (slot: RoleSlot) => {
    const res = await fetch(`/api/admin/role-slots/${slot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !slot.isActive }),
    });
    if (!res.ok) {
      toast.error('Failed to update role');
      return;
    }
    toast.success(
      slot.isActive
        ? 'Role hidden from applicants.'
        : 'Role visible to applicants.',
    );
    onChanged();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/role-slots/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Failed to delete role');
        return;
      }
      toast.success('Role removed.');
      setDeleteTarget(null);
      onChanged();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400">Roles Tracked</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totals.roles}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400">Approved &amp; Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {totals.approvedActive}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400">Total Capacity</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totals.capacity}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:cursor-pointer hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Add Role
        </button>
      </div>

      {filteredSlots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400">
            {roleSlots.length === 0
              ? 'No roles configured yet. Add one to start accepting applications for it.'
              : 'No roles match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredSlots.map((slot) => {
            const pct = Math.min(
              100,
              Math.round((slot.filledCount / slot.capacity) * 100),
            );
            const expanded = expandedRoles.has(slot.id);
            return (
              <div
                key={slot.id}
                className={`rounded-lg border bg-white p-5 shadow-sm ${!slot.isActive ? 'opacity-60' : ''}`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    {slot.name}
                  </h3>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(slot)}
                      className="rounded-lg p-1.5 text-gray-400 hover:cursor-pointer hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(slot)}
                      className="rounded-lg p-1.5 text-gray-400 hover:cursor-pointer hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  {slot.isFull ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
                      Full
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-600">
                      Open
                    </span>
                  )}
                  <button
                    onClick={() => toggleActive(slot)}
                    className="text-[11px] font-medium text-gray-400 hover:cursor-pointer hover:text-gray-600 hover:underline"
                  >
                    {slot.isActive
                      ? 'Hide from applicants'
                      : 'Show to applicants'}
                  </button>
                </div>
                <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${slot.isFull ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {slot.filledCount} / {slot.capacity} approved &amp; active
                </p>

                {slot.volunteers.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => toggleExpanded(slot.id)}
                      className="flex w-full items-center justify-between text-left hover:cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <UserCheck className="h-3.5 w-3.5 text-green-500" />{' '}
                        {expanded ? 'Hide' : 'View'} approved volunteers (
                        {slot.volunteers.length})
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expanded && (
                      <ul className="mt-2 space-y-1">
                        {slot.volunteers.map((v) => (
                          <li key={v.hiredVolunteerId}>
                            <button
                              onClick={() =>
                                setViewTarget({
                                  volunteer: v,
                                  roleName: slot.name,
                                })
                              }
                              className="flex w-full items-center gap-2.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-left transition-colors hover:cursor-pointer hover:bg-gray-100"
                            >
                              <VolunteerAvatar
                                firstName={v.firstName}
                                lastName={v.lastName}
                                avatarUrl={v.avatarUrl}
                                size="sm"
                              />
                              <span className="flex-1 text-xs font-medium text-gray-700">
                                {v.firstName} {v.lastName}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {v.hiredAt &&
                                  `Verified: ${new Date(v.hiredAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })}`}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-2">
              <span className="font-bold text-gray-900">Add Role</span>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-full p-1.5 text-gray-400 hover:cursor-pointer hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Role Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  list="suggested-roles"
                  placeholder="e.g. Rescue and Emergency Response"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <datalist id="suggested-roles">
                  {SUGGESTED_ROLES.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Available Slots
                </label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer hover:bg-orange-600 disabled:opacity-70"
              >
                {saving && <ShieldSpinLoader size={16} color="text-white" />}{' '}
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setEditTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-2">
              <span className="font-bold text-gray-900">
                Edit &quot;{editTarget.name}&quot;
              </span>
              <button
                onClick={() => setEditTarget(null)}
                className="rounded-full p-1.5 text-gray-400 hover:cursor-pointer hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {editTarget.filledCount > 0 && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {editTarget.filledCount} approved &amp; active volunteer
                  {editTarget.filledCount === 1 ? '' : 's'} currently hold this
                  role. Lowering capacity below that number won&apos;t remove
                  them.
                </p>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Available Slots
                </label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setEditTarget(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer hover:bg-orange-600 disabled:opacity-70"
              >
                {saving && <ShieldSpinLoader size={16} color="text-white" />}{' '}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {viewTarget && (
        <VolunteerDetailModal
          volunteer={viewTarget.volunteer}
          roleName={viewTarget.roleName}
          onClose={() => setViewTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this role?"
        description={`"${deleteTarget?.name}" will no longer be offered to applicants. This can't be undone.`}
        confirmLabel="Yes, Remove"
        tone="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function VolunteerDetailModal({
  volunteer,
  roleName,
  onClose,
}: {
  volunteer: RoleVolunteer;
  roleName: string;
  onClose: () => void;
}) {
  const statusStyle =
    volunteer.status === 'active'
      ? 'bg-green-100 text-green-600'
      : volunteer.status === 'suspended'
        ? 'bg-red-100 text-red-600'
        : 'bg-gray-100 text-gray-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <VolunteerAvatar
              firstName={volunteer.firstName}
              lastName={volunteer.lastName}
              avatarUrl={volunteer.avatarUrl}
              size="lg"
            />
            <div>
              <p className="font-bold text-gray-900">
                {volunteer.firstName} {volunteer.lastName}
              </p>
              <p className="text-xs text-gray-500">{roleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:cursor-pointer hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-400">Status</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${statusStyle}`}
            >
              {volunteer.status}
            </span>
          </div>
          <DetailRow icon={Mail} label="Email" value={volunteer.email} />
          <DetailRow
            icon={Phone}
            label="Contact Number"
            value={volunteer.contactNumber}
          />
          <DetailRow
            icon={MapPin}
            label="Address"
            value={volunteer.completeAddress}
          />
          <DetailRow
            icon={Calendar}
            label="Hired"
            value={
              volunteer.hiredAt
                ? new Date(volunteer.hiredAt).toLocaleDateString('en-PH', {
                    dateStyle: 'long',
                  })
                : null
            }
          />
          <DetailRow
            icon={Truck}
            label="Deployments"
            value={String(volunteer.deploymentCount)}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="truncate text-sm font-medium text-gray-700">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function DeploymentsPanel({
  deployments,
  roleSlots,
  onChanged,
}: {
  deployments: DeploymentWithParticipants[];
  roleSlots: RoleSlot[];
  onChanged: () => void;
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<Set<string>>(
    new Set(),
  );
  const [expandedDeployments, setExpandedDeployments] = useState<Set<string>>(
    new Set(),
  );
  const [deleteTarget, setDeleteTarget] =
    useState<DeploymentWithParticipants | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rolesWithVolunteers = useMemo(
    () => roleSlots.filter((r) => r.volunteers.length > 0),
    [roleSlots],
  );

  const filteredDeployments = useMemo(
    () =>
      deployments
        .filter((d) => roleFilter === ALL_ROLES || d.roles.includes(roleFilter))
        .filter(
          (d) =>
            d.title.toLowerCase().includes(search.toLowerCase()) ||
            (d.description ?? '').toLowerCase().includes(search.toLowerCase()),
        ),
    [deployments, roleFilter, search],
  );

  const openAdd = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate(new Date());
    setSelectedVolunteerIds(new Set());
    setShowModal(true);
  };

  const openEdit = (d: DeploymentWithParticipants) => {
    setEditingId(d.id);
    setTitle(d.title);
    setDescription(d.description ?? '');
    setDate(new Date(d.deploymentDate));
    setSelectedVolunteerIds(
      new Set(d.participants.map((p) => p.hiredVolunteerId)),
    );
    setShowModal(true);
  };

  const toggleVolunteer = (id: string) => {
    setSelectedVolunteerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleDeploymentExpanded = (id: string) => {
    setExpandedDeployments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!title.trim() || !date || selectedVolunteerIds.size === 0) {
      toast.error('Title, date, and at least one volunteer are required.');
      return;
    }
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/deployments/${editingId}`
        : '/api/admin/deployments';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          deploymentDate: date.toISOString(),
          volunteerIds: Array.from(selectedVolunteerIds),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(
          result.error ??
            `Failed to ${editingId ? 'update' : 'log'} deployment`,
        );
        return;
      }
      toast.success(editingId ? 'Deployment updated.' : 'Deployment logged.');
      setShowModal(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/deployments/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Failed to delete deployment');
        return;
      }
      toast.success('Deployment deleted.');
      setDeleteTarget(null);
      onChanged();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deployments..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ROLES}>All roles</SelectItem>
              {roleSlots.map((r) => (
                <SelectItem key={r.id} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={openAdd}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:cursor-pointer hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Log Deployment
        </button>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center">
          <Truck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400">
            {deployments.length === 0
              ? 'No deployments logged yet.'
              : 'No deployments match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeployments.map((d) => {
            const expanded = expandedDeployments.has(d.id);

            return (
              <div
                key={d.id}
                className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">
                      {d.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {d.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                    {d.description && (
                      <p className="mt-1.5 text-sm text-gray-600">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    <button
                      onClick={() => openEdit(d)}
                      className="rounded-lg p-1.5 text-gray-400 hover:cursor-pointer hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="rounded-lg p-1.5 text-gray-400 hover:cursor-pointer hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-gray-50 pt-3">
                  <p className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Calendar className="h-3 w-3" />{' '}
                    {new Date(d.deploymentDate).toLocaleDateString('en-PH', {
                      dateStyle: 'medium',
                    })}
                  </p>
                  {d.participants.length > 0 && (
                    <div className="flex -space-x-2">
                      {d.participants
                        .slice(0, PARTICIPANT_PREVIEW_LIMIT)
                        .map((p) => (
                          <VolunteerAvatar
                            key={p.hiredVolunteerId}
                            firstName={p.firstName}
                            lastName={p.lastName}
                            avatarUrl={p.avatarUrl}
                            size="sm"
                            ring
                          />
                        ))}
                    </div>
                  )}
                  {d.participants.length > PARTICIPANT_PREVIEW_LIMIT && (
                    <span className="text-xs font-medium text-gray-400">
                      +{d.participants.length - PARTICIPANT_PREVIEW_LIMIT} more
                    </span>
                  )}
                  {d.participants.length === 0 && (
                    <span className="text-xs text-gray-400">
                      No volunteers recorded.
                    </span>
                  )}

                  <button
                    onClick={() => toggleDeploymentExpanded(d.id)}
                    className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-orange-600 hover:cursor-pointer hover:underline"
                  >
                    {expanded ? 'Hide' : 'View'} details
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
                {expanded && <DeploymentDetailTable deployment={d} />}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <span className="font-bold text-gray-900">
                {editingId ? 'Edit Deployment' : 'Log Deployment'}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-gray-400 hover:cursor-pointer hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flood Response Drill — Brgy. Poblacion"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Date
                </label>
                <DatePicker date={date} onChange={setDate} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description{' '}
                  <span className="text-orange-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. Joint flood-response drill with local barangay officials."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Volunteers Involved
                  </label>
                  <span className="text-xs text-gray-400">
                    {selectedVolunteerIds.size} selected
                  </span>
                </div>
                {rolesWithVolunteers.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs text-gray-400">
                    No approved, active volunteers yet.
                  </p>
                ) : (
                  <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3">
                    {rolesWithVolunteers.map((slot) => (
                      <div key={slot.id}>
                        <p className="mb-1 px-1 text-[11px] font-bold tracking-wide text-gray-400 uppercase">
                          {slot.name} ({slot.volunteers.length})
                        </p>
                        <div className="space-y-0.5">
                          {slot.volunteers.map((v) => {
                            const checked = selectedVolunteerIds.has(
                              v.hiredVolunteerId,
                            );
                            return (
                              <label
                                key={v.hiredVolunteerId}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleVolunteer(v.hiredVolunteerId)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <VolunteerAvatar
                                  firstName={v.firstName}
                                  lastName={v.lastName}
                                  avatarUrl={v.avatarUrl}
                                  size="sm"
                                />
                                <span className="flex-1 text-sm text-gray-700">
                                  {v.firstName} {v.lastName}
                                </span>
                                {checked && (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-gray-100 bg-white px-5 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer hover:bg-orange-600 disabled:opacity-70"
              >
                {saving && <ShieldSpinLoader size={16} color="text-white" />}{' '}
                {editingId ? 'Save Changes' : 'Log Deployment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this deployment?"
        description={`"${deleteTarget?.title}" and its participant record will be permanently deleted. This can't be undone.`}
        confirmLabel="Yes, Delete"
        tone="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DeploymentDetailTable({
  deployment,
}: {
  deployment: DeploymentWithParticipants;
}) {
  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-400">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">Address</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {deployment.participants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-xs text-gray-400"
                >
                  No volunteers recorded for this deployment.
                </td>
              </tr>
            ) : (
              deployment.participants.map((p, i) => {
                const province = listProvinces().find(
                  (province) => province.psgcCode === p?.provinceCode,
                );

                const municipality = listMuncities().find(
                  (municipality) =>
                    municipality.psgcCode === p?.municipalityCode,
                );

                const barangay = listBarangays().find(
                  (barangay) => barangay.psgcCode === p?.barangayCode,
                );
                return (
                  <tr
                    key={p.hiredVolunteerId}
                    className="border-b border-gray-100 bg-white last:border-0"
                  >
                    <td className="px-4 py-2 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <VolunteerAvatar
                          firstName={p.firstName}
                          lastName={p.lastName}
                          avatarUrl={p.avatarUrl}
                          size="sm"
                        />
                        <span className="font-medium text-gray-800">
                          {p.firstName} {p.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{p.role}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {p.contactNumber || '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {`${p.completeAddress}, ${String(barangay?.brgyName)}, ${String(municipality?.munCityName)}, ${String(province?.provName)}`}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                          p.status === 'active'
                            ? 'bg-green-100 text-green-600'
                            : p.status === 'suspended'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsPanel({
  roleSlots,
  deployments,
}: {
  roleSlots: RoleSlot[];
  deployments: DeploymentWithParticipants[];
}) {
  const [roleSearch, setRoleSearch] = useState('');
  const [deploymentSearch, setDeploymentSearch] = useState('');
  const [deploymentRoleFilter, setDeploymentRoleFilter] = useState(ALL_ROLES);
  const [expandedDeployments, setExpandedDeployments] = useState<Set<string>>(
    new Set(),
  );

  const totalApprovedActive = roleSlots.reduce(
    (sum, s) => sum + s.filledCount,
    0,
  );
  const uniqueVolunteersDeployed = useMemo(() => {
    const ids = new Set<string>();
    deployments.forEach((d) =>
      d.participants.forEach((p) => ids.add(p.hiredVolunteerId)),
    );
    return ids.size;
  }, [deployments]);

  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    { label: 'Roles Tracked', value: roleSlots.length, icon: Users },
    { label: 'Approved & Active', value: totalApprovedActive, icon: UserCheck },
    { label: 'Deployments Logged', value: deployments.length, icon: Truck },
    {
      label: 'Volunteers Deployed',
      value: uniqueVolunteersDeployed,
      icon: CheckCircle2,
    },
  ];

  const filteredRoles = useMemo(() => {
    const q = roleSearch.toLowerCase();
    if (!q) return roleSlots;
    return roleSlots
      .map((slot) => ({
        ...slot,
        volunteers: slot.volunteers.filter(
          (v) =>
            slot.name.toLowerCase().includes(q) ||
            `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) ||
            (v.email ?? '').toLowerCase().includes(q),
        ),
      }))
      .filter(
        (slot) =>
          slot.name.toLowerCase().includes(q) || slot.volunteers.length > 0,
      );
  }, [roleSlots, roleSearch]);

  const filteredDeployments = useMemo(
    () =>
      deployments
        .filter(
          (d) =>
            deploymentRoleFilter === ALL_ROLES ||
            d.roles.includes(deploymentRoleFilter),
        )
        .filter((d) => {
          const q = deploymentSearch.toLowerCase();
          return (
            d.title.toLowerCase().includes(q) ||
            d.roles.some((r) => r.toLowerCase().includes(q)) ||
            d.participants.some((p) =>
              `${p.firstName} ${p.lastName}`.toLowerCase().includes(q),
            )
          );
        }),
    [deployments, deploymentRoleFilter, deploymentSearch],
  );

  const toggleDeploymentExpanded = (id: string) => {
    setExpandedDeployments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportRolesCSV = () => {
    const headers = [
      'Role',
      'First Name',
      'Last Name',
      'Email',
      'Contact Number',
      'Address',
      'Secondary Role',
      'Status',
      'Hired Date',
      'Deployments',
    ];
    const rows = roleSlots.flatMap((slot) =>
      slot.volunteers.length > 0
        ? slot.volunteers.map((v) => [
            slot.name,
            v.firstName,
            v.lastName,
            v.email ?? '',
            v.contactNumber ?? '',
            v.completeAddress ?? '',
            v.secondaryRole ?? '',
            v.status,
            v.hiredAt ? new Date(v.hiredAt).toLocaleDateString('en-CA') : '',
            v.deploymentCount,
          ])
        : [[slot.name, '', '', '', '', '', '', '', '', 0]],
    );
    downloadCSV(
      `role-records-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  };

  const exportDeploymentsCSV = () => {
    const headers = [
      'Deployment',
      'Date',
      'Volunteer First Name',
      'Volunteer Last Name',
      'Volunteer Role',
      'Logged By',
      'Logged At',
    ];
    const rows = deployments.flatMap((d) =>
      d.participants.length > 0
        ? d.participants.map((p) => [
            d.title,
            new Date(d.deploymentDate).toLocaleDateString('en-CA'),
            p.firstName,
            p.lastName,
            p.role,
            d.createdByName ?? '',
            new Date(d.createdAt).toLocaleDateString('en-CA'),
          ])
        : [
            [
              d.title,
              new Date(d.deploymentDate).toLocaleDateString('en-CA'),
              '',
              '',
              '',
              d.createdByName ?? '',
              new Date(d.createdAt).toLocaleDateString('en-CA'),
            ],
          ],
    );
    downloadCSV(
      `deployment-records-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="hidden print:block">
        <h2 className="text-lg font-bold text-gray-900">
          Volunteer Records Report
        </h2>
        <p className="text-xs text-gray-500">
          Generated{' '}
          {new Date().toLocaleString('en-PH', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <div className="flex items-center justify-between print:hidden">
        <p className="text-sm text-gray-500">
          A consolidated view of every role and every deployment on record.
        </p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" /> Print Records
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-100 bg-white p-4"
          >
            <div className="flex items-center gap-1.5 text-gray-400">
              <s.icon className="h-3.5 w-3.5" />
              <p className="text-xs">{s.label}</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <h2 className="text-base font-bold text-gray-900">Roles Report</h2>
            <p className="text-xs text-gray-500">
              Every role and every approved, active volunteer assigned to it
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search roles or volunteers..."
                className="w-64 rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <button
              onClick={exportRolesCSV}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {filteredRoles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-10 text-center print:hidden">
            <p className="text-sm text-gray-400">No roles match your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((slot) => (
              <div
                key={slot.id}
                className="overflow-hidden rounded-lg border border-gray-100 bg-white print:break-inside-avoid"
              >
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
                  <span className="text-sm font-bold text-gray-900">
                    {slot.name}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {slot.filledCount} / {slot.capacity} approved &amp; active
                  </span>
                </div>
                {slot.volunteers.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-gray-400">
                    No approved, active volunteers assigned yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-50 text-xs text-gray-400">
                          <th className="px-4 py-2 font-medium">Name</th>
                          <th className="px-4 py-2 font-medium">Email</th>
                          <th className="px-4 py-2 font-medium">Contact</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Hired</th>
                          <th className="px-4 py-2 font-medium">Deployments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slot.volunteers.map((v) => (
                          <tr
                            key={v.hiredVolunteerId}
                            className="border-b border-gray-50 last:border-0"
                          >
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <VolunteerAvatar
                                  firstName={v.firstName}
                                  lastName={v.lastName}
                                  avatarUrl={v.avatarUrl}
                                  size="sm"
                                />
                                <span className="font-medium text-gray-800">
                                  {v.firstName} {v.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {v.email || '—'}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {v.contactNumber || '—'}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${v.status === 'active' ? 'bg-green-100 text-green-600' : v.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                              >
                                {v.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {v.hiredAt
                                ? new Date(v.hiredAt).toLocaleDateString(
                                    'en-PH',
                                    { dateStyle: 'medium' },
                                  )
                                : '—'}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {v.deploymentCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Deployments Report
            </h2>
            <p className="text-xs text-gray-500">
              Every deployment on record, with full participant details
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={deploymentSearch}
                onChange={(e) => setDeploymentSearch(e.target.value)}
                placeholder="Search deployments..."
                className="w-56 rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <Select
              value={deploymentRoleFilter}
              onValueChange={setDeploymentRoleFilter}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ROLES}>All roles</SelectItem>
                {roleSlots.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={exportDeploymentsCSV}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {filteredDeployments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-10 text-center print:hidden">
            <p className="text-sm text-gray-400">
              No deployments match your search.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeployments.map((d) => {
              const expanded = expandedDeployments.has(d.id);

              return (
                <div
                  key={d.id}
                  className="rounded-lg border border-gray-100 bg-white p-4 print:break-inside-avoid"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900">
                        {d.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {d.roles.join(', ')} ·{' '}
                        {new Date(d.deploymentDate).toLocaleDateString(
                          'en-PH',
                          {
                            dateStyle: 'medium',
                          },
                        )}
                      </p>
                      {d.description && (
                        <p className="mt-1.5 text-sm text-gray-600">
                          {d.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDeploymentExpanded(d.id)}
                      className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-50 print:hidden"
                    >
                      {expanded ? 'Hide' : 'View'} full details
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <p className="mb-1.5 text-xs font-medium text-gray-500">
                      {d.participants.length} volunteer
                      {d.participants.length === 1 ? '' : 's'} deployed
                    </p>
                    {d.participants.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No volunteers recorded for this deployment.
                      </p>
                    ) : (
                      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {d.participants.map((p) => (
                          <li
                            key={p.hiredVolunteerId}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <VolunteerAvatar
                              firstName={p.firstName}
                              lastName={p.lastName}
                              avatarUrl={p.avatarUrl}
                              size="sm"
                            />
                            <span className="truncate">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="shrink-0 text-xs text-gray-400">
                              · {p.role}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="mt-3 flex items-center gap-1 border-t border-gray-50 pt-2 text-[11px] text-gray-400">
                    <Clock className="h-3 w-3" /> Logged{' '}
                    {new Date(d.createdAt).toLocaleDateString('en-PH', {
                      dateStyle: 'medium',
                    })}
                    {d.createdByName && <> by {d.createdByName}</>}
                  </p>
                  {expanded && <DeploymentDetailTable deployment={d} />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
