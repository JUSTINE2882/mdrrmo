import { AnnouncementType } from '@/types';

export const ANNOUNCEMENT_STYLES: Record<
  AnnouncementType,
  {
    gradient: string;
    label: string;
    icon: string;
  }
> = {
  urgent: {
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    label: 'Urgent Announcement',
    icon: '🚨',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    label: 'Important Notice',
    icon: '⚠️',
  },
  success: {
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    label: 'Good News',
    icon: '✅',
  },
  info: {
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    label: 'Announcement',
    icon: '📢',
  },
};

export const statusConfig = {
  draft: { label: 'Draft', badge: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Scheduled', badge: 'bg-purple-100 text-purple-700' },
  published: { label: 'Active', badge: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', badge: 'bg-gray-100 text-gray-500' },
};
