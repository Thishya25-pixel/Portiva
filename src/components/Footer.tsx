// src/components/Footer.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on editor and individual site slug pages
  const isPublicSite = pathname !== "/" && 
                       !pathname.startsWith("/dashboard") && 
                       !pathname.startsWith("/login") && 
                       !pathname.startsWith("/signup") && 
                       !pathname.startsWith("/terms") && 
                       !pathname.startsWith("/privacy") && 
                       !pathname.startsWith("/refund") && 
                       !pathname.startsWith("/contact");

  if (pathname.startsWith("/editor") || isPublicSite) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.08] bg-[#080b12] text-slate-400 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Portiva. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <Link href="/refund" className="hover:text-white transition">Refund Policy</Link>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}