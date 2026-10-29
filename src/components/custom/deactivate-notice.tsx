import { ShieldOff } from 'lucide-react';

export function DeactivatedNotice({
  status,
}: {
  status: 'inactive' | 'suspended';
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center py-10 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <ShieldOff className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">
        {status === 'suspended'
          ? 'Your Volunteer Account Has Been Suspended'
          : 'Your Volunteer Account Has Been Deactivated'}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        You no longer have access to your volunteer profile, application, or
        deployment history. If you believe this is a mistake, please contact the
        MDRRMO Mansalay office directly.
      </p>
      <p className="mt-4 text-xs text-gray-400">support@mdrrmom.com</p>
    </div>
  );
}
