'use client';
import { statusConfig } from '@/data/admin/announcements';
import {
  PREDEFINED_TAGS,
  typeConfig,
} from '@/data/volunteer/announcements-type-config';
import { AnnouncementInput, announcementSchema } from '@/lib/validation/schema';
import { Announcement, EffectiveStatus } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  Lock,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ConfirmDialog } from '../custom/confirmation-dialog';
import { ShieldSpinLoader } from '../custom/loading';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

function getEffectiveStatus(a: Announcement): EffectiveStatus {
  if (
    a.status === 'published' &&
    a.expiresAt &&
    new Date(a.expiresAt) < new Date()
  ) {
    return 'archived';
  }
  return a.status;
}

function toDatetimeLocal(date: Date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
}

const EDITABLE_STATUSES: EffectiveStatus[] = ['draft', 'scheduled'];

const EMPTY_STATE_MESSAGES: Record<'all' | EffectiveStatus, string> = {
  all: 'No announcements yet. Create your first one.',
  draft: 'No drafts saved. Save one to come back to later.',
  scheduled: 'Nothing scheduled right now.',
  published: 'No active announcements right now.',
  archived:
    'No archived announcements yet — expired ones land here automatically.',
};

export function AnnouncementsClient({
  announcements,
  openComposer: defaultOpen,
}: {
  announcements: Announcement[];
  openComposer: boolean;
}) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();
  const [showComposer, setShowComposer] = useState(defaultOpen);
  const [viewAnn, setViewAnn] = useState<Announcement | null>(null);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | EffectiveStatus>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [repeatOn, setRepeatOn] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [submitAction, setSubmitAction] = useState<
    'draft' | 'publish' | 'edit' | null
  >(null);
  const [publishTarget, setPublishTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      type: 'info',
      tags: [],
      repeatBroadcast: false,
      scheduledAt: toDatetimeLocal(new Date()),
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchType = watch('type') ?? 'info';
  const watchTitle = watch('title') ?? '';
  const watchBody = watch('body') ?? '';
  const watchScheduledAt = watch('scheduledAt');
  const isScheduledForFuture =
    !!watchScheduledAt &&
    new Date(watchScheduledAt).getTime() > Date.now() + 60_000;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const openCreateComposer = () => {
    setEditingAnn(null);
    reset({
      title: '',
      body: '',
      type: 'info',
      tags: [],
      repeatBroadcast: false,
      expiresAt: undefined,
      broadcastFrequency: undefined,
      scheduledAt: toDatetimeLocal(new Date()),
    });
    setTags([]);
    setRepeatOn(false);
    setShowComposer(true);
  };

  const openEditComposer = (ann: Announcement) => {
    setEditingAnn(ann);
    reset({
      title: ann.title,
      body: ann.body,
      type: ann.type,
      tags: (ann.tags as string[]) ?? [],
      repeatBroadcast: ann.repeatBroadcast ?? false,
      expiresAt: ann.expiresAt
        ? new Date(ann.expiresAt).toISOString().slice(0, 10)
        : undefined,
      broadcastFrequency:
        (ann.broadcastFrequency as AnnouncementInput['broadcastFrequency']) ??
        undefined,
      scheduledAt: ann.scheduledAt
        ? toDatetimeLocal(new Date(ann.scheduledAt))
        : toDatetimeLocal(new Date()),
    });
    setTags((ann.tags as string[]) ?? []);
    setRepeatOn(ann.repeatBroadcast ?? false);
    setViewAnn(null);
    setShowComposer(true);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setEditingAnn(null);
  };

  const onSubmit = async (
    data: AnnouncementInput,
    action: 'draft' | 'publish',
  ) => {
    const isEditing = !!editingAnn;
    setSubmitAction(isEditing ? 'edit' : action);

    try {
      const url = isEditing
        ? `/api/admin/announcements/${editingAnn!.id}`
        : '/api/admin/announcements';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing
            ? { ...data, tags, repeatBroadcast: repeatOn }
            : { ...data, tags, repeatBroadcast: repeatOn, action },
        ),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error ??
            `Failed to ${isEditing ? 'update' : 'save'} announcement`,
        );
        return;
      }

      if (isEditing) {
        toast.success('Announcement updated.');
      } else if (action === 'draft') {
        toast.success('Saved as draft.');
      } else if (result.status === 'scheduled') {
        toast.success(
          `Scheduled for ${new Date(watchScheduledAt!).toLocaleString()}.`,
        );
      } else {
        toast.success(
          `Published! Sent to ${result.emailsSent ?? 0} approved volunteers.`,
        );
      }

      reset();
      setTags([]);
      setRepeatOn(false);
      setEditingAnn(null);
      setShowComposer(false);
      startTransition(() => router.refresh());
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitAction(null);
    }
  };

  const confirmPublish = async () => {
    if (!publishTarget) return;
    setPublishingId(publishTarget.id);
    try {
      const res = await fetch(
        `/api/admin/announcements/${publishTarget.id}/publishing`,
        { method: 'PATCH' },
      );
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? 'Failed to publish');
        return;
      }
      toast.success(
        `Published! Sent to ${result.emailsSent ?? 0} approved volunteers.`,
      );
      setPublishTarget(null);
      startTransition(() => router.refresh());
    } finally {
      setPublishingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/announcements/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Failed to delete');
        return;
      }
      toast.success('Deleted');
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = announcements
    .filter((a) => tab === 'all' || getEffectiveStatus(a) === tab)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const tabCounts = {
    all: announcements.length,
    draft: announcements.filter((a) => getEffectiveStatus(a) === 'draft')
      .length,
    scheduled: announcements.filter(
      (a) => getEffectiveStatus(a) === 'scheduled',
    ).length,
    published: announcements.filter(
      (a) => getEffectiveStatus(a) === 'published',
    ).length,
    archived: announcements.filter((a) => getEffectiveStatus(a) === 'archived')
      .length,
  };

  return (
    <div className="mx-auto w-full space-y-6 p-6 mb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Create and manage system-wide announcements
          </p>
        </div>
        <button
          onClick={openCreateComposer}
          className="flex items-center hover:cursor-pointer gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            ['all', 'draft', 'scheduled', 'published', 'archived'] as const
          ).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 hover:cursor-pointer text-xs font-semibold capitalize transition-colors ${
                tab === t
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'All' : statusConfig[t].label} ({tabCounts[t]})
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ann) => {
          const cfg = typeConfig[ann.type as keyof typeof typeConfig];
          const Icon = cfg.icon;
          const effectiveStatus = getEffectiveStatus(ann);

          // Archive = logs. Deliberately a different, muted, click-to-view-only
          // treatment — no color, no action buttons, no hover-as-interactive cue.
          if (effectiveStatus === 'archived') {
            return (
              <button
                key={ann.id}
                onClick={() => setViewAnn(ann)}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3 text-left transition-colors shadow hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                  <Icon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-500">
                      {ann.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-500">
                      {ann.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="h-3 w-3" /> Read-only
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
                    <Lock className="h-3 w-3 shrink-0" />
                    Sent{' '}
                    {ann.publishedAt
                      ? new Date(ann.publishedAt).toLocaleDateString('en-PH', {
                          dateStyle: 'medium',
                        })
                      : '—'}
                    {' · '}Expired{' '}
                    {ann.expiresAt
                      ? new Date(ann.expiresAt).toLocaleDateString('en-PH', {
                          dateStyle: 'medium',
                        })
                      : '—'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
              </button>
            );
          }

          const sCfg = statusConfig[effectiveStatus];
          const canEdit = EDITABLE_STATUSES.includes(effectiveStatus);

          return (
            <div
              key={ann.id}
              className={`rounded-lg border bg-white ${cfg.border} overflow-hidden shadow-sm transition-shadow hover:shadow-md`}
            >
              <div
                className={`h-1 ${ann.type === 'urgent' ? 'bg-red-500' : ann.type === 'warning' ? 'bg-amber-500' : ann.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
              ></div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 ${cfg.bg} flex shrink-0 items-center justify-center rounded-lg`}
                  >
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <h3 className="text-base font-bold text-gray-900">
                        {ann.title}
                      </h3>
                      <span
                        className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${sCfg.badge}`}
                      >
                        {sCfg.label}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {((ann.tags as string[]) ?? [])
                          .slice(0, 2)
                          .map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {ann.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Created{' '}
                        {ann.createdAt
                          ? new Date(ann.createdAt).toLocaleDateString(
                              'en-PH',
                              { dateStyle: 'medium' },
                            )
                          : '—'}
                      </span>
                      {effectiveStatus === 'scheduled' && ann.scheduledAt && (
                        <span className="flex items-center gap-1 text-purple-500">
                          <Clock className="h-3 w-3" /> Sends{' '}
                          {new Date(ann.scheduledAt).toLocaleString('en-PH', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      )}
                      {effectiveStatus === 'published' && ann.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires{' '}
                          {new Date(ann.expiresAt).toLocaleDateString('en-PH', {
                            dateStyle: 'medium',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {effectiveStatus === 'draft' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setPublishTarget(ann)}
                            disabled={publishingId === ann.id}
                            title="Publish now"
                            className="rounded-lg hover:cursor-pointer bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                          >
                            {publishingId === ann.id ? (
                              <ShieldSpinLoader
                                size={16}
                                color="text-green-600"
                              />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Publish Now</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setViewAnn(ann)}
                          className="rounded-lg hover:cursor-pointer bg-blue-50 p-2 text-blue-500 transition-colors hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Announcement</p>
                      </TooltipContent>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openEditComposer(ann)}
                            className="rounded-lg hover:cursor-pointer bg-orange-50 p-2 text-orange-500 transition-colors hover:bg-orange-100"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Announcement</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setDeleteTarget(ann)}
                          className="rounded-lg hover:cursor-pointer bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Announcement</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-400">{EMPTY_STATE_MESSAGES[tab]}</p>
          </div>
        )}
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl scrollbar-none overflow-y-auto scroll rounded-lg bg-white shadow-lg">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                  <Megaphone className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">
                    {editingAnn ? 'Edit Announcement' : 'Announcement Composer'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {editingAnn
                      ? `Editing "${editingAnn.title}"`
                      : 'Create a new system-wide announcement'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeComposer}
                className="rounded-lg p-2 hover:cursor-pointer text-gray-400 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => onSubmit(data, 'publish'))}>
              <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-5">
                <div className="space-y-5 lg:col-span-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Announcement Title
                    </label>
                    <input
                      {...register('title')}
                      placeholder="Enter announcement title..."
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Message Body
                    </label>
                    <textarea
                      {...register('body')}
                      rows={5}
                      placeholder="Write your announcement..."
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    {errors.body && (
                      <p className="text-xs text-red-600">
                        {errors.body.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Announcement Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(['info', 'urgent', 'warning', 'success'] as const).map(
                        (type) => {
                          const c = typeConfig[type];
                          const TIcon = c.icon;
                          return (
                            <label
                              key={type}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${watchType === type ? `${c.bg} ${c.border} ${c.color}` : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                            >
                              <input
                                type="radio"
                                {...register('type')}
                                value={type}
                                className="sr-only"
                              />
                              <TIcon className="h-4 w-4" />
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Tag className="h-3.5 w-3.5" /> Tags
                    </label>
                    <div className="flex min-h-12 flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      {PREDEFINED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          type="button"
                          className={`rounded-full border hover:cursor-pointer px-3 py-1.5 text-xs font-medium transition-all ${tags.includes(tag) ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-orange-500'}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add custom tag..."
                        className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customTag.trim()) {
                            toggleTag(customTag.trim());
                            setCustomTag('');
                          }
                        }}
                        className="rounded-lg hover:cursor-pointer bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 lg:col-span-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Send className="h-4 w-4 text-orange-500" />
                      When to Send
                    </h3>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Leave as-is to send immediately, or pick a future
                      date/time to schedule
                    </label>
                    <input
                      {...register('scheduledAt')}
                      type="datetime-local"
                      disabled={!!editingAnn}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    {editingAnn ? (
                      <p className="mt-2 text-xs text-gray-400">
                        Send time can&apos;t be changed while editing.
                      </p>
                    ) : (
                      isScheduledForFuture && (
                        <p className="mt-2 text-xs font-medium text-purple-600">
                          This will be scheduled, not sent immediately.
                        </p>
                      )
                    )}
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Auto-Archive
                    </h3>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Expiry Date
                    </label>
                    <input
                      {...register('expiresAt')}
                      type="date"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          Repeat Broadcast
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRepeatOn(!repeatOn)}
                        className={`relative h-6 w-11 hover:cursor-pointer rounded-full transition-colors ${repeatOn ? 'bg-orange-500' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${repeatOn ? 'translate-x-0' : '-translate-x-4'}`}
                        ></span>
                      </button>
                    </div>
                    {repeatOn && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Frequency
                        </label>
                        <div className="relative">
                          <select
                            {...register('broadcastFrequency')}
                            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            {['Daily', 'Weekly', 'Bi-weekly', 'Monthly'].map(
                              (f) => (
                                <option key={f}>{f}</option>
                              ),
                            )}
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  {watchTitle && (
                    <div
                      className={`rounded-lg border p-4 ${typeConfig[watchType as keyof typeof typeConfig]?.border ?? 'border-gray-200'} ${typeConfig[watchType as keyof typeof typeConfig]?.bg ?? 'bg-gray-50'}`}
                    >
                      <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Preview
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {watchTitle}
                      </div>
                      {watchBody && (
                        <div className="mt-1 line-clamp-3 text-xs text-gray-600">
                          {watchBody}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky bottom-0 flex items-center justify-between rounded-b-lg border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded-lg bg-gray-100 hover:cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                {editingAnn ? (
                  <button
                    type="submit"
                    disabled={submitAction !== null}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 transition-colors hover:cursor-pointer hover:bg-orange-600 disabled:opacity-70"
                  >
                    {submitAction === 'edit' && (
                      <ShieldSpinLoader size={20} color="text-white" />
                    )}
                    {submitAction === 'edit' ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                      disabled={submitAction !== null}
                      className="flex items-center gap-2 rounded-lg bg-orange-50 hover:cursor-pointer px-4 py-2.5 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-100 disabled:opacity-60"
                    >
                      {submitAction === 'draft' && (
                        <ShieldSpinLoader size={20} color="text-orange-500" />
                      )}
                      {submitAction === 'draft' ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitAction !== null}
                      className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 transition-colors hover:cursor-pointer hover:bg-orange-600 disabled:opacity-70"
                    >
                      {submitAction === 'publish' ? (
                        <ShieldSpinLoader size={20} color="text-white" />
                      ) : isScheduledForFuture ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Megaphone className="h-4 w-4" />
                      )}
                      {submitAction === 'publish'
                        ? isScheduledForFuture
                          ? 'Scheduling...'
                          : 'Publishing...'
                        : isScheduledForFuture
                          ? 'Schedule'
                          : 'Publish Now'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {viewAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const cfg =
                    typeConfig[viewAnn.type as keyof typeof typeConfig];
                  const Icon = cfg.icon;
                  return (
                    <div
                      className={`h-9 w-9 ${cfg.bg} flex items-center justify-center rounded-lg`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${cfg.color}`}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </div>
                  );
                })()}
                <span className="font-bold text-gray-900">
                  Announcement Details
                </span>
              </div>
              <button
                onClick={() => setViewAnn(null)}
                className="rounded-lg p-2 hover:cursor-pointer text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig[getEffectiveStatus(viewAnn)].badge}`}
                >
                  {statusConfig[getEffectiveStatus(viewAnn)].label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {viewAnn.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {viewAnn.body}
              </p>
              {((viewAnn.tags as string[]) ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(viewAnn.tags as string[]).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">
                    {viewAnn.status === 'scheduled'
                      ? 'Scheduled for'
                      : 'Published'}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-gray-800">
                    {viewAnn.status === 'scheduled' && viewAnn.scheduledAt
                      ? new Date(viewAnn.scheduledAt).toLocaleString('en-PH', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : viewAnn.publishedAt
                        ? new Date(viewAnn.publishedAt).toLocaleDateString(
                            'en-PH',
                            { dateStyle: 'medium' },
                          )
                        : '—'}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">Expires</div>
                  <div className="mt-0.5 text-sm font-semibold text-gray-800">
                    {viewAnn.expiresAt
                      ? new Date(viewAnn.expiresAt).toLocaleDateString(
                          'en-PH',
                          { dateStyle: 'medium' },
                        )
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setViewAnn(null)}
                className="rounded-lg hover:cursor-pointer bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Close
              </button>
              {EDITABLE_STATUSES.includes(getEffectiveStatus(viewAnn)) && (
                <button
                  onClick={() => openEditComposer(viewAnn)}
                  className="flex hover:cursor-pointer items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!publishTarget}
        title="Publish this announcement?"
        description={`"${publishTarget?.title}" will be sent immediately to all approved volunteers. This can't be undone.`}
        confirmLabel="Yes, Publish"
        loading={publishingId === publishTarget?.id}
        onConfirm={confirmPublish}
        onCancel={() => setPublishTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this announcement?"
        description={`"${deleteTarget?.title}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Yes, Delete"
        tone="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
