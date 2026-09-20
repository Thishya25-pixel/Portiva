"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Portfolio",
  "Freelancer",
  "Student",
  "Personal profile",
  "Photographer",
  "Designer",
  "Restaurant",
  "Small business",
  "Gym",
  "Agency",
  "Other",
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreateWebsiteModal({
  isOpen,
  onClose,
  userId,
  initialStep = "create",
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialStep?: "create" | "upi";
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Portfolio");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // UPI state
  const [utr, setUtr] = useState("");
  const [isUpiStep, setIsUpiStep] = useState(initialStep === "upi");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const PRIMARY_UPI_ID = "thishyaradhyan@sbi";
  const SECONDARY_UPI_ID = "8088477123@upi";

  const router = useRouter();

  // Keep isUpiStep synchronized when initialStep prop changes
  useEffect(() => {
    setIsUpiStep(initialStep === "upi");
  }, [initialStep]);

  if (!isOpen) return null;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
    setSlug(slugify(value));
  }

  function handleCloseModal() {
    setError("");
    setNotice(null);
    setIsUpiStep(false);
    setUtr("");
    setSubmitted(false);
    onClose();
  }

  function copyUpiId() {
    navigator.clipboard.writeText(PRIMARY_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUpiSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setNotice(null);

    const trimmedUtr = utr.trim();

    if (!/^[a-zA-Z0-9]{12}$/.test(trimmedUtr)) {
      setError("Please enter the 12-character UTR / Reference number from your payment app.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Save the UTR payment request for the admin to verify later.
      const { error: insertError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: userId,
          amount: 199,
          utr_number: trimmedUtr,
          status: "pending",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This UTR number has already been submitted.");
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      // Start a 24-hour trial immediately so the user isn't left waiting.
      const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from("profiles")
        .update({
          is_pro: true,
          trial_ends_at: trialEndsAt,
        })
        .eq("id", userId);

      setSubmitted(true);
      setNotice(
        "🚀 Pro trial activated for 24 hours! We're verifying your payment and will upgrade you to a full month before the trial ends."
      );
      setUtr("");
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setNotice(null);

    try {
      const supabase = createClient();
      const finalSlug = slugify(slug || name);

      if (!finalSlug) {
        setError("Please enter a valid website name.");
        setLoading(false);
        return;
      }

      // Check slug uniqueness
      const { data: existing } = await supabase
        .from("websites")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (existing) {
        setError("This URL slug is already taken. Please pick another one.");
        setLoading(false);
        return;
      }

      // Insert website
      const { data: newSite, error: insertError } = await supabase
        .from("websites")
        .insert({
          user_id: userId,
          name,
          slug: finalSlug,
          category,
          template_id: "modern-portfolio",
          published: false,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      // Seed content
      await supabase.from("website_content").insert([
        {
          website_id: newSite.id,
          section: "hero",
          content: {
            title: name,
            subtitle: `Welcome to my ${category} website!`,
          },
        },
        {
          website_id: newSite.id,
          section: "about",
          content: {
            bio: "Write something awesome...",
            skills: ["Next.js", "Tailwind CSS"],
          },
        },
      ]);

      setLoading(false);
      handleCloseModal();
      router.refresh();
      router.push(`/editor/${newSite.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d111a] p-6 shadow-2xl shadow-black/50">
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute right-5 top-5 text-slate-500 transition hover:text-white"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold">
            P
          </div>

          <h2 className="text-xl font-semibold text-white">
            {isUpiStep ? "Upgrade to Pro" : "Create a new website"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {isUpiStep
              ? "Pay once, we verify manually, Pro unlocks shortly after."
              : "Start building your online presence with Portiva."}
          </p>
        </div>

        {/* Global Error & Notice Banners */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-300">
            {notice}
          </div>
        )}

        {/* View 1: Website Creation Form */}
        {!isUpiStep && (
          <form onSubmit={handleCreate} className="space-y-5">
            {/* Website Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Website name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="My Portfolio"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Website URL
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span className="whitespace-nowrap text-slate-500">/</span>

                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="my-portfolio"
                  className="w-full bg-transparent pl-1 text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Your website will be available at /{slug || "your-name"}
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#121722] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create website →"}
              </button>
            </div>

            {/* Upgrade Banner Button */}
            <div className="border-t border-white/10 pt-5">
              <p className="mb-3 text-center text-xs text-slate-400">
                ✨ Custom Domains, Remove Branding & Unlimited Sites
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice(null);
                  setIsUpiStep(true);
                }}
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                Upgrade to Pro — ₹199
              </button>
            </div>
          </form>
        )}

        {/* View 2: UPI Payment Step */}
        {isUpiStep && (
          <div className="space-y-4">
            {!submitted && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Pay & submit for verification
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Pay ₹199 via UPI, then enter your UTR number below. An
                    admin verifies each payment before Pro is activated —
                    usually within a few hours.
                  </p>
                </div>

                {/* UPI QR + Direct Transfer Box */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                  <p className="mb-3 text-xs font-medium text-slate-400">
                    Scan & Pay ₹199 using GPay, PhonePe, or Paytm:
                  </p>

                  <div className="mx-auto my-3 flex h-48 w-48 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
                    <img
                      src="/upi-qr.png"
                      alt="Portiva UPI QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400">
                    Or transfer directly to UPI ID:
                  </p>

                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-300">
                      {PRIMARY_UPI_ID}
                    </span>

                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/20"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500">
                    Alt ID: {SECONDARY_UPI_ID}
                  </p>
                </div>

                {/* Form for UTR submission */}
                <form onSubmit={handleUpiSubmit} className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-200">
                      12-Character UTR / Reference Number
                    </label>

                    <input
                      type="text"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      placeholder="e.g. 328409182391"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUpiStep(false)}
                      className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit for verification"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {submitted && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-2xl">
                  ✅
                </div>
                <p className="text-sm text-slate-300">
                  Your 24-hour Pro trial is active now. We're verifying your
                  payment reference and will extend it to a full month
                  before the trial runs out — no need to resubmit.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}