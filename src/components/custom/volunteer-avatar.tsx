export function VolunteerAvatar({
  firstName,
  lastName,
  avatarUrl,
  size = 'md',
  ring = false,
}: {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  ring?: boolean;
}) {
  const dimensions =
    size === 'sm'
      ? 'h-7 w-7 text-[10px]'
      : size === 'lg'
        ? 'h-11 w-11 text-sm'
        : 'h-9 w-9 text-xs';
  const ringClass = ring ? 'ring-2 ring-white' : '';

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${avatarUrl}`}
        alt={`${firstName} ${lastName}`}
        className={`${dimensions} ${ringClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
}
