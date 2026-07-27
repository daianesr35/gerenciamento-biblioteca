type PublicEnvironment = Readonly<{
  appUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
}>;

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

export function getPublicEnvironment(): PublicEnvironment {
  return {
    appUrl: required('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL),
    supabaseUrl: required(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabasePublishableKey: required(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}
