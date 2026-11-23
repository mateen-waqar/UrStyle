import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { authRepository } from "@/modules/authentication/repositories/authRepository";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user exists in Prisma AppUser database
      await authRepository.ensureAppUser(data.user.id, data.user.email!);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
}
