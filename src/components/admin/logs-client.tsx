'use client';

import { actionConfig, FILTER_GROUPS, LOGS_PAGE_SIZE } from '@/data/admin/logs';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { LogEntry } from '@/types';
import { ChevronLeft, ChevronRight, FileClock } from 'lucide-react';
import { useRouter } from 'next/navigation';

function getDateGroupLabel(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfLogDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfLogDay.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function groupLogsByDate(logs: LogEntry[]) {
  const groups: { label: string; entries: LogEntry[] }[] = [];
  for (const log of logs) {
    const label = getDateGroupLabel(log.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.label === label) {
      lastGroup.entries.push(log);
    } else {
      groups.push({ label, entries: [log] });
    }
  }
  return groups;
}

export function LogsClient({
  logs,
  total,
  currentPage,
  currentAction,
}: {
  logs: LogEntry[];
  total: number;
  currentPage: number;
  currentAction: string;
}) {
  const router = useRouter();
  const setFilter = (key: string) =>
    router.push(
      key === 'all'
        ? '/admin/dashboard/logs'
        : `/admin/dashboard/logs?action=${key}`,
    );
  const pageLink = (p: number) =>
    `/admin/dashboard/logs?page=${p}${currentAction !== 'all' ? `&action=${currentAction}` : ''}`;

  const totalPages = Math.max(1, Math.ceil(total / LOGS_PAGE_SIZE));
  const startItem = total === 0 ? 0 : (currentPage - 1) * LOGS_PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * LOGS_PAGE_SIZE, total);
  const groups = groupLogsByDate(logs);

  return (
    <div className="mx-auto w-full space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <FileClock className="h-6 w-6 text-orange-500" /> Activity Logs
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          A complete record of every action taken across the admin panel
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setFilter(g.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors hover:cursor-pointer ${
              currentAction === g.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        {logs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileClock className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-400">
              {currentAction === 'all'
                ? 'No activity recorded yet.'
                : 'No activity in this category yet.'}
            </p>
            {currentAction !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-xs font-medium text-orange-600 hover:cursor-pointer hover:underline"
              >
                View all activity instead
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="bg-gray-50/70 px-5 py-2">
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    {group.label}
                  </p>
                </div>
                <ul className="divide-y divide-gray-50">
                  {group.entries.map((log) => {
                    const cfg = actionConfig[log.action] ?? {
                      label: log.action,
                      icon: FileClock,
                      color: 'text-gray-500',
                      bg: 'bg-gray-100',
                    };
                    const Icon = cfg.icon;
                    return (
                      <li
                        key={log.id}
                        className="flex items-start gap-3 px-5 py-3.5"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
                        >
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold text-gray-900">
                              {log.name}
                            </span>{' '}
                            {cfg.label}
                            {log.targetLabel && (
                              <>
                                {' '}
                                —{' '}
                                <span className="font-medium text-gray-700">
                                  {log.targetLabel}
                                </span>
                              </>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {formatRelativeTime(log.createdAt)} ·{' '}
                            {new Date(log.createdAt).toLocaleString('en-PH', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {startItem}–{endItem}
            </span>{' '}
            of <span className="font-medium text-gray-700">{total}</span>{' '}
            entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(pageLink(currentPage - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="px-2 text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => router.push(pageLink(currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
