import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[10%] h-72 w-72 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Brand */}
        <Link
          href="/"
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
            P
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Portiva
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Your portfolio, live in minutes.
          </p>
        </Link>

        {/* Card */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}
        </section>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Portiva. Build your presence online.
        </p>
      </div>
    </main>
  );
}