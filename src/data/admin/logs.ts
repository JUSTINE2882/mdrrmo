import {
  CheckCircle,
  Clock,
  Download,
  Edit2,
  KeyRound,
  LogIn,
  LogOut,
  LucideIcon,
  Megaphone,
  RefreshCw,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  UserCog,
  UserPlus,
  XCircle,
} from 'lucide-react';

export const actionConfig: Record<
  string,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  admin_login: {
    label: 'signed in',
    icon: LogIn,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  admin_logout: {
    label: 'signed out',
    icon: LogOut,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  },
  admin_password_changed: {
    label: 'changed their password',
    icon: KeyRound,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  admin_profile_updated: {
    label: 'updated their profile',
    icon: UserCog,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  applicant_approved: {
    label: 'approved applicant',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  applicant_rejected: {
    label: 'rejected applicant',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  applicant_marked_under_review: {
    label: 'marked as under review',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  announcement_scheduled: {
    label: 'schedule announcement',
    icon: Megaphone,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  announcement_updated: {
    label: 'edited announcement',
    icon: Edit2,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  announcement_published: {
    label: 'published announcement',
    icon: Send,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  announcement_deleted: {
    label: 'deleted announcement',
    icon: Trash2,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  role_slot_created: {
    label: 'added role',
    icon: UserPlus,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  role_slot_updated: {
    label: 'updated role',
    icon: Settings,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  role_slot_deleted: {
    label: 'removed role',
    icon: Trash2,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  deployment_created: {
    label: 'logged deployment',
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  deployment_deleted: {
    label: 'delete deployment',
    icon: Trash2,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  deployment_updated: {
    label: 'update deployment',
    icon: Settings,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  new_pending_volunteer_applicant: {
    label: 'new pending volunteer application',
    icon: Clock,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  activate_account: {
    label: 're-activate volunteer account',
    icon: ShieldCheck,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  deactivate_account: {
    label: 'deactivate volunteer account',
    icon: ShieldAlert,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  volunteer_status_changed: {
    label: 'updated volunteer status',
    icon: RefreshCw,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  volunteers_exported: {
    label: 'export list of all verified volunteer',
    icon: Download,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
  },
};

export const FILTER_GROUPS = [
  { key: 'all', label: 'All Activity' },
  {
    key: 'applicant_approved,applicant_rejected,applicant_marked_under_review,new_pending_volunteer_applicant,deactivate_account,activate_account',
    label: 'Applicants',
  },
  {
    key: 'announcement_scheduled,announcement_updated,announcement_published,announcement_deleted',
    label: 'Announcements',
  },
  {
    key: 'role_slot_created,role_slot_updated,role_slot_deleted',
    label: 'Roles',
  },
  {
    key: 'deployment_created,deployment_updated,deployment_deleted',
    label: 'Deployments',
  },
  {
    key: 'admin_login,admin_logout,admin_password_changed,admin_profile_updated',
    label: 'Account',
  },
];

export const LOGS_PAGE_SIZE = 8;
