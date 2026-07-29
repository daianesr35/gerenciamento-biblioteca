'use server';

import { redirect } from 'next/navigation';

import { signOutOwner } from '@/data/supabase/auth';

export type LogoutActionState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'error'; message: string }>;

export async function logoutAction(
  _previousState: LogoutActionState,
): Promise<LogoutActionState> {
  void _previousState;

  try {
    await signOutOwner();
  } catch {
    return {
      status: 'error',
      message: 'Não foi possível sair. Tente novamente.',
    };
  }

  redirect('/login');
}
