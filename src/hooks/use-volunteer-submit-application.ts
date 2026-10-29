'use client';

import {
  ApplicationStep1Input,
  applicationStep1Schema,
} from '@/lib/validation/schema';

import {
  saveVolunteerApplicationDraftServices,
  submitVolunteerApplicationServices,
} from '@/services/application.service';

import { uploadFileServices } from '@/services/upload.service';

import type { FullApplication, UploadedDocs } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Props {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  existingApplication?: FullApplication | null;
}

const MAX_MULTI_FILES = 5;

const EMPTY_DOCS: UploadedDocs = {
  trainingCertUrls: [],
};

const getDefaultFormValues = ({
  firstName,
  lastName,
  email,
  existingApplication,
}: Props): ApplicationStep1Input => {
  const emergency = existingApplication?.emergencyContact;
  return {
    firstName: existingApplication?.firstName ?? firstName ?? '',
    middleName: existingApplication?.middleName ?? '',
    lastName: existingApplication?.lastName ?? lastName ?? '',
    email: existingApplication?.email ?? email ?? '',
    gender: (existingApplication?.gender ??
      'Male') as ApplicationStep1Input['gender'],
    age: existingApplication?.age ?? 18,
    dateOfBirth: existingApplication?.dateOfBirth ?? '',
    nationality: existingApplication?.nationality ?? 'Filipino',
    nativePlace: existingApplication?.nativePlace ?? '',
    educationLevel: existingApplication?.educationLevel ?? '',
    maritalStatus: (existingApplication?.maritalStatus ??
      'Single') as ApplicationStep1Input['maritalStatus'],
    employmentStatus: (existingApplication?.employmentStatus ??
      'Unemployed') as ApplicationStep1Input['employmentStatus'],
    natureOfEmployment: existingApplication?.natureOfEmployment ?? '',
    position: existingApplication?.position ?? '',
    employer: existingApplication?.employer ?? '',
    primaryRole: existingApplication?.primaryRole ?? '',
    secondaryRole: existingApplication?.secondaryRole ?? '',
    idNumber: existingApplication?.idNumber ?? '',
    idCardType: existingApplication?.idCardType ?? '',
    completeAddress: existingApplication?.completeAddress ?? '',
    provinceCode: existingApplication?.provinceCode ?? '',
    municipalityCode: existingApplication?.municipalityCode ?? '',
    barangayCode: existingApplication?.barangayCode ?? '',
    contactNumber: existingApplication?.contactNumber ?? '',
    homePhone: existingApplication?.homePhone ?? '',
    emergencyName: emergency?.name ?? '',
    emergencyRelation: emergency?.relation ?? '',
    emergencyContact: emergency?.contactNumber ?? '',
    emergencyAddress: emergency?.address ?? '',
    volunteeringExperience: existingApplication?.volunteeringExperience ?? '',
  };
};

const getInitialDocs = (
  existingApplication?: FullApplication | null,
): UploadedDocs => {
  if (!existingApplication) {
    return {
      ...EMPTY_DOCS,
    };
  }

  return {
    photoUrl: existingApplication.photoUrl ?? undefined,
    validIdFrontUrl: existingApplication.validIdFrontUrl ?? undefined,
    validIdBackUrl: existingApplication.validIdBackUrl ?? undefined,
    trainingCertUrls: existingApplication.trainingCertUrl ?? [],
  };
};

export const useVolunteerSubmitApplication = ({
  firstName,
  lastName,
  email,
  existingApplication,
}: Props) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [docs, setDocs] = useState<UploadedDocs>(
    getInitialDocs(existingApplication),
  );

  const [step1Data, setStep1Data] = useState<ApplicationStep1Input | null>(
    existingApplication?.applicationStatus === 'draft'
      ? getDefaultFormValues({
          firstName,
          lastName,
          email,
          existingApplication,
        })
      : null,
  );

  const [certified, setCertified] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ApplicationStep1Input>({
    resolver: zodResolver(applicationStep1Schema),
    defaultValues: getDefaultFormValues({
      firstName,
      lastName,
      email,
      existingApplication,
    }),
  });
  // "1705200000" '175207000'
  const uploadFile = async (
    file: File,
    type: string,
  ): Promise<string | null> => {
    try {
      const response = await uploadFileServices(file, type);
      const json = await response.json();
      if (!response.ok) {
        toast.error(json.error ?? `Failed to upload ${file.name}`);
        return null;
      }
      return json.url as string;
    } catch {
      toast.error(`Failed to upload ${file.name}. Please try again.`);
      return null;
    }
  };

  const setUploading = (key: string, value: boolean) => {
    setUploadingKeys((previous) => {
      const next = new Set(previous);
      if (value) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: 'photoUrl' | 'validIdFrontUrl' | 'validIdBackUrl',
    uploadType: string,
    successLabel = 'Document',
  ) => {
    const file = e.target.files?.[0];

    e.target.value = '';

    if (!file) {
      return;
    }

    setUploading(uploadType, true);
    const url = await uploadFile(file, uploadType);
    setUploading(uploadType, false);
    if (!url) {
      return;
    }
    setDocs((previous) => ({
      ...previous,
      [docKey]: url,
    }));
    toast.success(`${successLabel} uploaded!`);
  };

  const handleMultiFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: 'trainingCertUrls',
    uploadType: string,
  ) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) {
      return;
    }

    const remainingSlots = MAX_MULTI_FILES - docs[docKey].length;

    if (remainingSlots <= 0) {
      toast.error(
        `You can upload up to ${MAX_MULTI_FILES} training certificates.`,
      );

      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > filesToUpload.length) {
      toast.error(
        `Only ${remainingSlots} more file${
          remainingSlots > 1 ? 's' : ''
        } can be added (max ${MAX_MULTI_FILES}).`,
      );
    }

    setUploading(uploadType, true);

    const results = await Promise.all(
      filesToUpload.map((file) => uploadFile(file, uploadType)),
    );

    setUploading(uploadType, false);

    const newUrls = results.filter((url): url is string => Boolean(url));

    if (!newUrls.length) {
      return;
    }

    setDocs((previous) => ({
      ...previous,
      trainingCertUrls: [...previous.trainingCertUrls, ...newUrls],
    }));

    toast.success(
      `${newUrls.length} training certificate${
        newUrls.length > 1 ? 's' : ''
      } uploaded!`,
    );
  };

  const removeMultiFile = (_docKey: 'trainingCertUrls', url: string) => {
    setDocs((previous) => ({
      ...previous,

      trainingCertUrls: previous.trainingCertUrls.filter(
        (item) => item !== url,
      ),
    }));
  };

  const getMissingDocumentMessage = (): string | null => {
    if (!docs.photoUrl) {
      return 'Please upload your profile photo first.';
    }
    if (!docs.validIdFrontUrl || !docs.validIdBackUrl) {
      return 'Please upload both sides of your Valid ID first.';
    }
    if (docs.trainingCertUrls.length === 0) {
      return 'Please upload at least one training certificate first.';
    }

    return null;
  };

  const onStep1Submit = (data: ApplicationStep1Input) => {
    setStep1Data(data);
    setStep(2);
  };

  const onSaveDraft = async () => {
    const currentData = getValues();

    setIsDraftSaving(true);

    try {
      const response = await saveVolunteerApplicationDraftServices({
        ...currentData,
        ...docs,
        status: 'draft',
      });

      const json = await response.json();

      if (!response.ok) {
        toast.error(json.error ?? 'Failed to save application draft.');

        return;
      }

      setStep1Data(currentData);
      toast.success('Application saved as draft.');
      router.push('/profile');
      router.refresh();
    } catch {
      toast.error('Failed to save application draft. Please try again.');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const onFinalSubmit = async () => {
    const isStep1Valid = await new Promise<boolean>((resolve) => {
      handleSubmit(
        () => resolve(true),
        () => resolve(false),
      )();
    });

    if (!isStep1Valid) {
      setStep(1);
      toast.error('Please complete all required information.');
      return;
    }

    const currentData = getValues();
    setStep1Data(currentData);
    const missingDocMessage = getMissingDocumentMessage();
    if (missingDocMessage) {
      toast.error(missingDocMessage);
      setStep(2);
      return;
    }

    if (!certified) {
      toast.error('Please certify that your information is true and correct.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitVolunteerApplicationServices({
        ...currentData,
        ...docs,
      });

      const json = await response.json();

      if (!response.ok) {
        toast.error(json.error ?? 'Submission failed.');

        return;
      }

      toast.success('Application submitted successfully!');
      router.push('/profile');
      router.refresh();
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    docs,
    step,
    setStep,
    step1Data,
    control,
    watch,
    setValue,
    getValues,
    isSubmitting,
    isDraftSaving,
    uploadingKeys,
    certified,
    setCertified,
    register,
    handleSubmit,
    errors,
    handleFileChange,
    handleMultiFileChange,
    removeMultiFile,
    onStep1Submit,
    onSaveDraft,
    onFinalSubmit,
    MAX_MULTI_FILES,
    getMissingDocumentMessage,
  };
};

export default useVolunteerSubmitApplication;
