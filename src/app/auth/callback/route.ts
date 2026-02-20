import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase redirects users here after email confirmation or password reset.
 * The URL contains a `code` param that we exchange for a session, then
 * redirect to the appropriate page based on the `next` search param.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("인증 링크가 만료되었거나 유효하지 않습니다.")}`
  );
}
