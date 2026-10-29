'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { typeConfig } from '@/data/volunteer/announcements-type-config';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { NotificationItem } from '@/types';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useState } from 'react';

export function Notifications({
  announcements,
}: {
  announcements: NotificationItem[];
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(announcements.filter((a) => a.isRead).map((a) => a.id)),
  );
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState<NotificationItem | null>(null);

  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;
  const latest = announcements.slice(0, 3);

  const markRead = (id: string) => {
    if (readIds.has(id)) return;
    setReadIds((prev) => new Set(prev).add(id));
    fetch(`/api/volunteer/notifications/${id}/read`, { method: 'POST' }).catch(
      (err) => console.error('Failed to mark notification read:', err),
    );
  };

  const openDetail = (item: NotificationItem) => {
    markRead(item.id);
    setDetail(item);
  };

  return (
    <div className="relative">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="relative rounded-lg p-2 outline-0 hover:cursor-pointer text-gray-500 transition-colors hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4 w-80 overflow-hidden rounded-lg border border-gray-100 bg-white p-0 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">
              Notifications
            </span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-500">
                {unreadCount} new
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <CheckCheck className="h-3 w-3" /> All caught up
              </span>
            )}
          </div>

          {latest.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No announcements yet.
            </div>
          ) : (
            latest.map((n) => (
              <NotificationRow
                key={n.id}
                item={n}
                isRead={readIds.has(n.id)}
                onClick={() => {
                  setDropdownOpen(false);
                  openDetail(n);
                }}
              />
            ))
          )}

          {announcements.length > 0 && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                setShowAll(true);
              }}
              className="w-full border-t border-gray-100 py-2.5 text-center text-xs font-semibold text-orange-600 hover:cursor-pointer hover:bg-orange-50"
            >
              View all notifications
            </button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showAll && (
        <div
          className="fixed inset-0 w-full ax h-screen z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowAll(false)}
        >
          <div
            className="flex max-h-[90vh] h-fit  w-full max-w-2xl pb-4 flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 shadow px-5 py-4">
              <span className="font-bold text-gray-900">All Notifications</span>
              <button
                onClick={() => setShowAll(false)}
                className="rounded-full p-1.5 text-gray-400 hover:cursor-pointer hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-gray-400">
                  No announcements yet.
                </div>
              ) : (
                announcements.map((n) => (
                  <NotificationRow
                    key={n.id}
                    item={n}
                    isRead={readIds.has(n.id)}
                    onClick={() => {
                      setShowAll(false);
                      openDetail(n);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div
          className="fixed w-full h-screen inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const cfg = typeConfig[detail.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                  );
                })()}
                <span className="text-xs font-medium text-gray-400">
                  {formatRelativeTime(detail.publishedAt)}
                </span>
                {((detail.tags as string[]) ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(detail.tags as string[]).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-full p-1.5 text-gray-400 hover:cursor-pointer hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <h3 className="text-xl font-bold text-gray-900">
                {detail.title}
              </h3>

              <p className="mt-4 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-gray-600">
                {detail.body}
              </p>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  isRead,
  onClick,
}: {
  item: NotificationItem;
  isRead: boolean;
  onClick: () => void;
}) {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:cursor-pointer hover:bg-gray-50 ${
        !isRead ? 'bg-orange-50/40' : ''
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
      >
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`text-sm ${isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}
        >
          {item.title}
        </div>
        <div className="mt-0.5 truncate text-xs text-gray-500">{item.body}</div>
        <div className="mt-1 text-xs text-gray-400">
          {formatRelativeTime(item.publishedAt)}
        </div>
      </div>
      {!isRead && (
        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
      )}
    </button>
  );
}
