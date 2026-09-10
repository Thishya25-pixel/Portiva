// src/app/reset-password/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // 1. Check existing session first
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCheckingSession(false);
          return;
        }
      } catch (err) {
        console.error("Session fetch error:", err);
      }

      // 2. Fallback listener for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "PASSWORD_RECOVERY" || session) {
            setCheckingSession(false);
          } else {
            setMessage("Your reset link is invalid or expired.");
            setCheckingSession(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    }

    initSession();
  }, []);

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully!");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  }

  return (
    <AuthLayout
      title="Create a new password"
      subtitle="Choose a strong password to keep your Portiva account secure."
    >
      {checkingSession ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Verifying your reset session...
        </div>
      ) : (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              New password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-slate-700 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Updating password..." : "Update password →"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}