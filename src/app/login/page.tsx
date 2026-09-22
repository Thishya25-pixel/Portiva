"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.3A10.4 10.4 0 0112 5c6.5 0 10 7 10 7a15.6 15.6 0 01-3.3 4.1M6.4 6.4A15.6 15.6 0 002 12s3.5 7 10 7a10.3 10.3 0 004.2-.9" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your portfolio and keep building your online presence."
    >
      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-300"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in to Portiva →"}
        </button>
      </form>

      <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-indigo-400 transition hover:text-indigo-300">
          Create one free
        </Link>
      </div>
    </AuthLayout>
  );
}