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
  
  // Strip www. if present so www.portiva.online behaves like portiva.online
  const cleanHost = hostname.replace(/^www\./, "").split(":")[0];
  
  const rawDomain = process.env.MAIN_DOMAIN || "portiva.online";
  const baseDomain = rawDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").split(":")[0];
  
  const pathname = request.nextUrl.pathname;

  // Let platform routes pass through directly
  const isPlatformRoute = PLATFORM_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPlatformRoute) {
    return NextResponse.next();
  }

  // Subdomain check (ignoring www)
  const isSubdomain =
    cleanHost !== baseDomain &&
    cleanHost !== "localhost" &&
    cleanHost !== "127.0.0.1" &&
    cleanHost.endsWith(`.${baseDomain}`);

  if (isSubdomain) {
    const subdomain = cleanHost.replace(`.${baseDomain}`, "");

    if (subdomain) {
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