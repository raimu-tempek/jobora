import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn("Middleware: Missing Supabase environment variables.");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper to create redirect response while preserving updated auth cookies
  const createRedirect = (targetPath: string) => {
    // Safety check: if already on target path, never redirect to self (prevents loop)
    if (pathname === targetPath || pathname === `${targetPath}/`) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    const redirectResponse = NextResponse.redirect(url);
    // Copy all cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  // 1. Explicitly public routes (strictly excluded from unauthenticated protection)
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname.startsWith("/register/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/");

  // 2. Explicitly protected routes
  const isProtectedRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/applications" ||
    pathname.startsWith("/applications/") ||
    pathname === "/finance" ||
    pathname.startsWith("/finance/");

  // Guard A: Unauthenticated user on a public route -> allow directly (NEVER redirect to /login)
  if (isPublicRoute && !user) {
    return supabaseResponse;
  }

  // Guard B: Authenticated user visiting /login or /register -> redirect back to /dashboard
  if (
    user &&
    (pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname === "/register" ||
      pathname.startsWith("/register/"))
  ) {
    return createRedirect("/dashboard");
  }

  // Guard C: Unauthenticated user accessing a protected route -> redirect to /login
  if (!user && isProtectedRoute) {
    return createRedirect("/login");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image/asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
