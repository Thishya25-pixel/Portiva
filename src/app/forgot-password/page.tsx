"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
});

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setEmailSent(true);
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a secure link to reset your password."
    >
      {emailSent ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5 text-center">
          
          <div className="text-3xl">✉</div>

          <h3 className="mt-3 font-semibold text-green-300">
            Check your email
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-green-200/70">
            If an account exists with that email address, we've sent password
            reset instructions.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Don't forget to check your spam folder.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Back to sign in →
          </Link>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleForgotPassword}
            className="space-y-5"
          >
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
                ? "Sending reset link..."
                : "Send reset link →"}
            </button>
          </form>

          <div className="mt-7 border-t border-white/10 pt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              ← Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}