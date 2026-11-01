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
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    // Copy all cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/finance");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/register/");

  // 1. Redirect unauthenticated users away from protected pages to /login
  if (!user && isProtectedRoute) {
    return createRedirect("/login");
  }

  // 2. Redirect authenticated users away from /login and /register to /dashboard
  if (user && isAuthRoute) {
    return createRedirect("/dashboard");
  }

  // 3. Root path '/' routing: /dashboard if logged in, otherwise /login
  if (pathname === "/") {
    return createRedirect(user ? "/dashboard" : "/login");
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
