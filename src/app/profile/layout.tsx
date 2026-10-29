import { SignOutButton } from '@/components/auth/sign-out-button';
import { Shared } from '@/components/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notifications } from '@/components/volunteer/notifications';
import { statusConfig } from '@/data/status';
import { db } from '@/lib/db';
import { getNotificationsForVolunteer } from '@/lib/db/queries/notifications.queries';
import {
  hiredVolunteers,
  volunteerApplications,
  volunteerProfiles,
} from '@/lib/db/schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import { ChevronDown, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DisplayLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const notifications = await getNotificationsForVolunteer(user.id);

  const profile = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.id, user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const application = await db
    .select({ status: volunteerApplications.applicationStatus })
    .from(volunteerApplications)
    .where(eq(volunteerApplications.volunteerId, user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const [hiredRecord] = await Promise.all([
    db
      .select()
      .from(hiredVolunteers)
      .where(eq(hiredVolunteers.volunteerId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);

  return (
    <div className="h-screen w-full items-center justify-center ">
      <div className="sticky px-6 md:px-4 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md ">
        <div className="mx-auto flex py-5 max-w-6xl items-center justify-between">
          <Shared.Brand />

          <div className="flex items-center gap-2">
            <Notifications announcements={notifications} />
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-0" asChild>
                <button className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:cursor-pointer">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${profile && profile.avatarUrl ? 'bg-none' : ' bg-linear-to-br from-orange-400 to-orange-600'}`}
                  >
                    {profile && profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="rounded-full w-7 h-7 object-contain"
                        src={profile.avatarUrl}
                        alt={profile.avatarUrl}
                      />
                    ) : (
                      <span>{user.email?.charAt(0)}</span>
                    )}
                  </div>
                  <span className="hidden text-sm font-semibold text-gray-700 sm:block">
                    {profile
                      ? `${profile.firstName} ${profile.lastName}`
                      : user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 mr-4" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>

                  <div className="mb-4 flex flex-col items-center text-center">
                    <div
                      className={`mb-3 flex h-12 w-16 items-center justify-center rounded-lg  text-2xl font-bold text-white ${profile && profile.avatarUrl ? 'bg-none' : 'bg-linear-to-br from-orange-400 to-orange-600'}`}
                    >
                      {profile && profile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="rounded-full w-12 h-12 object-contain"
                          src={profile.avatarUrl}
                          alt={profile.avatarUrl}
                        />
                      ) : (
                        <span>{user.email?.charAt(0)}</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900">
                      {profile
                        ? `${profile.firstName} ${profile.lastName}`
                        : user.email}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
                    {hiredRecord?.status === 'inactive' ? (
                      <>
                        <span className="mt-2 rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                          Account Deactivated
                        </span>
                      </>
                    ) : (
                      <>
                        {application && (
                          <span
                            className={`mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[application.status as keyof typeof statusConfig]?.class}`}
                          >
                            {application.status
                              .replace('_', ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        )}
                      </>
                    )}

                    {!application && (
                      <Link
                        href="/profile/apply"
                        className="mt-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-200 transition-colors"
                      >
                        Apply Now →
                      </Link>
                    )}
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <Link
                      className="text-sm flex py-1 items-center gap-2 font-mono"
                      href={'/profile'}
                    >
                      <User className="h-4 w-4 shrink-0" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      className="text-sm flex py-1 items-center gap-2 font-mono"
                      href={'/profile/apply'}
                    >
                      <FileText className="h-4 w-4 shrink-0" /> My Application
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <div className="w-full">
                      <SignOutButton />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl md:px-4 px-6 py-6 md:py-4 lg:flex lg:gap-8">
        {children}
      </div>
    </div>
  );
}
