'use server';

import { signUpOwner } from '@/data/supabase/auth';
import { registerOwner } from '@/services/auth';
import type { RegistrationActionState } from '@/types/auth';

function readFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export async function registerAction(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  return registerOwner(
    {
      name: readFormValue(formData, 'name'),
      email: readFormValue(formData, 'email'),
      password: readFormValue(formData, 'password'),
    },
    signUpOwner,
  );
}
