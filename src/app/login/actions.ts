'use server';

import { signInOwner } from '@/data/supabase/auth';
import { loginOwner } from '@/services/auth';
import type { LoginActionState } from '@/types/auth';

function readFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  return loginOwner(
    {
      email: readFormValue(formData, 'email'),
      password: readFormValue(formData, 'password'),
    },
    signInOwner,
  );
}
