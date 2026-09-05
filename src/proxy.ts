import { NextResponse, type NextRequest } from "next/server";

// Routes that belong to the Portiva platform itself.
// These should NEVER be treated as tenant website routes.
const PLATFORM_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/editor",
  "/auth",
];

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  const MAIN_DOMAIN =
    process.env.NEXT_PUBLIC_MAIN_DOMAIN || "localhost";

  // Remove port number
  const currentHost = hostname.split(":")[0];
  const baseDomain = MAIN_DOMAIN.split(":")[0];

  const pathname = request.nextUrl.pathname;

  // Check whether the request is going to a Portiva platform route
  const isPlatformRoute = PLATFORM_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  // Never rewrite platform routes
  if (isPlatformRoute) {
    return NextResponse.next();
  }

  // Check if this request is coming from a subdomain
  const isSubdomain =
    currentHost !== baseDomain &&
    currentHost !== "localhost" &&
    currentHost !== "127.0.0.1" &&
    currentHost.endsWith(`.${baseDomain}`);

  if (isSubdomain) {
    // Extract subdomain
    const subdomain = currentHost.replace(`.${baseDomain}`, "");

    // Ignore www
    if (subdomain && subdomain !== "www") {
      const url = request.nextUrl;

      // Example:
      // thishya.portiva.com/about
      //
      // internally becomes:
      // /thishya/about
      const targetPath =
        pathname === "/"
          ? `/${subdomain}`
          : `/${subdomain}${pathname}`;

      return NextResponse.rewrite(
        new URL(`${targetPath}${url.search}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all routes except:
     * - API routes
     * - Next.js static files
     * - Next.js image optimization files
     * - favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};