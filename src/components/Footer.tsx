"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();

  // Define the exact main marketing / app routes where the Portiva site footer SHOULD render
  const APP_ROUTES = [
    "/",
    "/login",
    "/signup",
    "/dashboard",
    "/terms",
    "/privacy",
    "/refund",
    "/contact",
  ];

  // Check if current route is an official Portiva platform route
  const isAppRoute = APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If the user is on an editor page OR any public user site ([slug] / wildcard subdomain), hide the main app footer
  if (pathname.startsWith("/editor") || !isAppRoute) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.08] bg-[#080b12] text-slate-400 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Portiva. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/terms" className="hover:text-white transition">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
          <Link href="/refund" className="hover:text-white transition">
            Refund Policy
          </Link>
          <Link href="/contact" className="hover:text-white transition">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}