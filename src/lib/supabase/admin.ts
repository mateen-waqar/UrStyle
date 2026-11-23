import { createClient } from "@supabase/supabase-js";

// Administrative Supabase client with service_role key
// WARNING: Strictly for server-side trusted processes, webhooks, or background jobs.
// NEVER import or use in client-side code.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey || serviceRoleKey === "placeholder-service-role-key") {
    // Return standard client or notify if service role key is not configured
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
