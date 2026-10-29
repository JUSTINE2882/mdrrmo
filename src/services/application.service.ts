import { ApplicationStep1Input } from '@/lib/validation/schema';
import { UploadedDocs } from '@/types';

export type SubmitApplicationPayload = ApplicationStep1Input & UploadedDocs;

export type SaveApplicationDraftPayload = Partial<ApplicationStep1Input> &
  Partial<UploadedDocs> & {
    status: 'draft';
  };

export async function submitVolunteerApplicationServices(
  payload: SubmitApplicationPayload,
) {
  return fetch('/api/volunteer/application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function saveVolunteerApplicationDraftServices(
  payload: SaveApplicationDraftPayload,
) {
  return fetch('/api/volunteer/application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function getVolunteerApplication() {
  return fetch('/api/volunteer/application', {
    method: 'GET',
    cache: 'no-store',
  });
}
