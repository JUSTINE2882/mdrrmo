'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { ShieldSpinLoader } from '../custom/loading';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const isDanger = tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isDanger ? 'bg-red-50' : 'bg-orange-50'
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${isDanger ? 'text-red-500' : 'text-orange-500'}`}
            />
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:cursor-pointer hover:bg-gray-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 pb-2 pt-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:cursor-pointer hover:bg-gray-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:cursor-pointer disabled:opacity-70 ${
              isDanger
                ? 'bg-red-500 shadow-red-200 hover:bg-red-600'
                : 'bg-orange-500 shadow-orange-200 hover:bg-orange-600'
            }`}
          >
            {loading && <ShieldSpinLoader size={20} color="text-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
