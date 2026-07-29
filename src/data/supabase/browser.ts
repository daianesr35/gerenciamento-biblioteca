import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseEnvironment } from '@/config/env';

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const environment = getSupabaseEnvironment();

    browserClient = createBrowserClient(
      environment.supabaseUrl,
      environment.supabasePublishableKey,
    );
  }

  return browserClient;
}
