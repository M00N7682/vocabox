import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession (cookie-only, no network call) for routing decisions.
  // Actual auth verification happens in server components via getUser().
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { pathname } = request.nextUrl;

  // Public pages - skip auth check entirely
  const publicPaths = ["/report"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return supabaseResponse;

  // Auth pages - redirect to dashboard if already logged in
  const authPages = ["/login", "/signup", "/forgot-password"];
  if (user && authPages.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protected pages - redirect to login if not logged in
  const protectedPaths = [
    "/dashboard",
    "/students",
    "/classes",
    "/vocab",
    "/tests",
    "/scores",
    "/schedule",
    "/reports",
    "/settings",
    "/subjects",
    "/textbooks",
    "/assessments",
    "/attendance",
    "/analytics",
    "/assignments",
    "/notifications",
    "/payments",
  ];

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
