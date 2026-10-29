'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/');
    router.refresh();
  };

  return (
    <button
      className="w-full py-2 flex gap-2 text-red-500 transition-all duration-300 hover:text-red-500/90 hover:cursor-pointer items-center"
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4 " />
      <span>Sign Out</span>
    </button>
  );
}
