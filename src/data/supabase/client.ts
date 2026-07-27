import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getPublicEnvironment } from '@/config/env';

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const environment = getPublicEnvironment();

    browserClient = createClient(
      environment.supabaseUrl,
      environment.supabasePublishableKey,
    );
  }

  return browserClient;
}
