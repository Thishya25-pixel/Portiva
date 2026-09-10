// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

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
  
  // Read private server variable and strip any leading protocols if present
  const rawDomain = process.env.MAIN_DOMAIN || "portiva.online";
  const MAIN_DOMAIN = rawDomain.replace(/^https?:\/\//, "");

  const currentHost = hostname.split(":")[0];
  const baseDomain = MAIN_DOMAIN.split(":")[0];
  const pathname = request.nextUrl.pathname;

  // Let static assets & platform routes pass through directly
  const isPlatformRoute = PLATFORM_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPlatformRoute) {
    return NextResponse.next();
  }

  // Subdomain check
  const isSubdomain =
    currentHost !== baseDomain &&
    currentHost !== "localhost" &&
    currentHost !== "127.0.0.1" &&
    currentHost.endsWith(`.${baseDomain}`);

  if (isSubdomain) {
    const subdomain = currentHost.replace(`.${baseDomain}`, "");

    if (subdomain && subdomain !== "www") {
      const url = request.nextUrl;
      const targetPath =
        pathname === "/" ? `/${subdomain}` : `/${subdomain}${pathname}`;

      return NextResponse.rewrite(
        new URL(`${targetPath}${url.search}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};