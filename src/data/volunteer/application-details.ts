import { DocumentItem } from '@/types';
import { CheckCircle, FileText, IdCard, User } from 'lucide-react';

export const documentTypes: DocumentItem[] = [
  {
    kind: 'sides',
    front: {
      key: 'validIdFrontUrl',
      uploadType: 'validIdFront',
      label: 'Front',
    },
    back: {
      key: 'validIdBackUrl',
      uploadType: 'validIdBack',
      label: 'Back',
    },
    label: 'Valid Government ID',
    desc: "National ID, Voter's ID, Driver's License, or Passport — front and back",
    icon: IdCard,
    required: true,
  },
  {
    kind: 'multiple',
    key: 'trainingCertUrls',
    uploadType: 'trainingCert',
    itemLabel: 'Certificate',
    label: 'Training Certificate',
    desc: 'Disaster response, first aid, or relevant certifications — add as many as you have',
    icon: FileText,
    required: true,
  },
];

export const steps = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Documents', icon: FileText },
  { id: 3, title: 'Review & Submit', icon: CheckCircle },
];
