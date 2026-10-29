'use client';

import { getVolunteerApplication } from '@/services/application.service';
import { FullApplication } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

export const useVolunteerApplicationPreview = () => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<FullApplication | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const openPreview = async () => {
    setShowPreview(true);
    if (previewData) return;

    setPreviewLoading(true);
    try {
      const res = await getVolunteerApplication();
      const json = await res.json();

      if (!res.ok || !json.application) {
        toast.error(json.error ?? 'Could not load your application.');
        setShowPreview(false);
        return;
      }

      setPreviewData(json.application as FullApplication);
    } catch {
      toast.error('Could not load your application. Please try again.');
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  return {
    openPreview,
    previewLoading,
    showPreview,
    previewData,
    setShowPreview,
  };
};

export default useVolunteerApplicationPreview;
