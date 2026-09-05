"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function SignUpPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("SUCCESS");
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building your professional portfolio in just a few minutes."
    >
      {message === "SUCCESS" ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5 text-center">
          <div className="text-2xl">✓</div>

          <h3 className="mt-3 font-semibold text-green-300">
            Check your inbox
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-green-200/70">
            We sent a confirmation link to your email address. Click it to
            activate your Portiva account.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Back to sign in →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-5">

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="John Doe"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

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
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
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
            {isSubmitting
              ? "Creating your account..."
              : "Create my account →"}
          </button>
        </form>
      )}

      <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-400 transition hover:text-indigo-300"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}