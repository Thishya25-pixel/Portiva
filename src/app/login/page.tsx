"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      <form onSubmit={handleLogin} className="space-y-5">

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {message && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in to Portiva →"}
        </button>
      </form>

      <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-indigo-400 transition hover:text-indigo-300"
        >
          Create one free
        </Link>
      </div>
    </AuthLayout>
  );
}