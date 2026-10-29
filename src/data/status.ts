import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export const statusConfig = {
  pending: {
    label: 'Pending Review',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
    class: 'bg-amber-100 text-amber-700 border border-amber-200',
    iconClass: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: AlertCircle,
    class: 'bg-blue-100 text-blue-700 border border-blue-200',
    iconClass: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircle,
    class: 'bg-green-100 text-green-700 border border-green-200',
    iconClass: 'text-green-600',
    dot: 'bg-green-500',
  },
  rejected: {
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    label: 'Rejected',
    icon: XCircle,
    class: 'bg-red-100 text-red-700 border border-red-200',
    iconClass: 'text-red-600',
    dot: 'bg-red-500',
  },
};
