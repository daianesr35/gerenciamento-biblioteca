import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/app-shell';
import { getServerAuthIdentity } from '@/data/supabase/auth';

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getServerAuthIdentity();

  if (auth.status === 'anonymous') {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
