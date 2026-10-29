import {
  LayoutDashboard,
  Megaphone,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Applicants', href: '/admin/dashboard/applicants', icon: Users },
  {
    name: 'Announcements',
    href: '/admin/dashboard/announcements',
    icon: Megaphone,
  },
  {
    name: 'Verified Volunteers',
    href: '/admin/dashboard/volunteers',
    icon: UserCheck,
  },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export default navigation;
