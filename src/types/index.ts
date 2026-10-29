import { LucideIcon } from 'lucide-react';

export type {
  adminUsers,
  announcements,
  announcementTypeEnum,
  applicationStatusEnum,
  hiredVolunteers,
  volunteerApplications,
  volunteerProfiles,
  volunteerStatusEnum,
} from '@/lib/db/schema';

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fields?: Record<string, string[]> };

export type UserRole = 'VOLUNTEER' | 'ADMIN';

export type UploadedDocs = {
  validIdFrontUrl?: string;
  validIdBackUrl?: string;
  trainingCertUrls: string[];
  photoUrl?: string;
};

export type SingleDocKey = 'photoUrl' | 'validIdFrontUrl' | 'validIdBackUrl';

export type ExistingApp = {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date | null;
};

export type ApplicationFormClientProps = {
  existingApplication: FullApplication | null;
  availableRoles: string[];
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export type AdminPayload = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  lastLoginAt: Date | null;
};

export type AdminAsideProps = {
  admin: AdminPayload;
};

export type DocumentItem =
  | {
      kind: 'sides';
      front: { key: 'validIdFrontUrl'; uploadType: string; label: string };
      back: { key: 'validIdBackUrl'; uploadType: string; label: string };
      label: string;
      desc: string;
      icon: LucideIcon;
      required: boolean;
    }
  | {
      kind: 'multiple';
      key: 'trainingCertUrls';
      uploadType: string;
      itemLabel: string;
      label: string;
      desc: string;
      icon: LucideIcon;
      required: boolean;
    };

export type ApplicationStatus =
  'draft' | 'pending' | 'under_review' | 'approved' | 'rejected';

export type EmploymentStatus = 'Employed' | 'Unemployed';

export type Gender = 'Male' | 'Female' | 'Prefer not to say';

export type MaritalStatus = 'Single' | 'Married' | 'Widowed' | 'Annulment';

export type FullApplication = {
  id: string;
  volunteerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: Gender;
  age: number;
  dateOfBirth: string;
  nationality: string;
  nativePlace: string;
  educationLevel: string;
  maritalStatus: MaritalStatus;
  employmentStatus: EmploymentStatus;
  natureOfEmployment: string | null;
  position: string | null;
  employer: string | null;
  primaryRole: string;
  secondaryRole: string;
  idNumber: string;
  idCardType: string;
  completeAddress: string;
  provinceCode: string;
  municipalityCode: string;
  barangayCode: string;
  contactNumber: string;
  homePhone: string | null;
  email: string;
  emergencyContact: {
    name: string;
    relation: string;
    contactNumber: string;
    address: string;
  } | null;
  volunteeringExperience: string | null;
  validIdFrontUrl: string | null;
  validIdBackUrl: string | null;
  trainingCertUrl: string[] | null;
  photoUrl: string | null;
  applicationStatus: ApplicationStatus;
  reviewedBy: number | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  submittedAt: Date | null;
  updatedAt: Date;
};

export type SingleUploadSlotProps = {
  url?: string;
  label?: string;
  compact?: boolean;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export type MultiUploadSlotProps = {
  urls: string[];
  uploading: boolean;
  max: number;
  itemLabel: string;
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (url: string) => void;
};

export type ApplicationPreviewModalProps = {
  data: FullApplication | null;
  loading: boolean;
  onClose: () => void;
};

export interface DocumentSet {
  photoUrl?: string | null;
  validIdFrontUrl?: string | null;
  validIdBackUrl?: string | null;
  trainingCertUrls?: string[] | null;
}

export type DocumentThumbProps = {
  url: string;
  label?: string;
};

export interface CategoryProps {
  icon: LucideIcon;
  title: string;
  emptyText: string;
  documents: { url: string; label: string }[];
}

export type VolunteerStatus = 'active' | 'inactive' | 'suspended';

export type Volunteer = {
  id: string;
  avatar: string | null;
  role: string;
  status: VolunteerStatus;
  hiredAt: Date | null;
  deploymentCount: number | null;
  trainings: string[] | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  contactNumber: string | null;
  completeAddress: string | null;
  barangayCode: string | null;
  municipalityCode: string | null;
  provinceCode: string | null;
};

export type AdminUser = {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  role: string;
  lastLoginAt: Date | null;
  createdAt: Date | null;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  tags: string[] | null;
  isActive: boolean;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  publishedAt: Date | null;
  expiresAt: Date | null;
  repeatBroadcast: boolean | null;
  broadcastFrequency: string | null;
  createdAt: Date | null;
};

export type AnnouncementType = 'info' | 'urgent' | 'warning' | 'success';

export type EffectiveStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  tags: string[] | null;
  publishedAt: Date | null;
  isRead: boolean;
}

export interface LogEntry {
  id: string;
  name: string;
  action: string;
  targetLabel: string | null;
  createdAt: Date;
}

export interface RoleVolunteer {
  hiredVolunteerId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string | null;
  contactNumber: string | null;
  completeAddress: string | null;
  secondaryRole: string | null;
  status: 'active' | 'inactive' | 'suspended';
  hiredAt: Date | null;
  deploymentCount: number;
}

export interface RoleSlot {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  filledCount: number;
  isFull: boolean;
  volunteers: RoleVolunteer[];
}

export interface PreparedRole {
  id: string;
  roleName: string;
  availableSlots: number;
}

export interface DeploymentParticipantDetail {
  hiredVolunteerId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  contactNumber: string | null;
  completeAddress: string | null;
  barangayCode: string | null;
  municipalityCode: string | null;
  provinceCode: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export type DeploymentWithParticipants = {
  id: string;
  title: string;
  description: string | null;
  deploymentDate: Date;
  createdAt: Date;
  createdByName: string | null;
  roles: string[]; // replaces the old single `role: string` field
  participants: DeploymentParticipantDetail[];
};
