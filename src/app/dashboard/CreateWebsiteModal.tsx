"use client";

import { useState } from "react";
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
    .replace(/[^a-z0-9\s-]/g, "") // remove anything not alnum space hyphen
    .replace(/\s+/g, "-") // spaces -> hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens
}

export default function CreateWebsiteModal({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Portfolio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  if (!isOpen) return null;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);

    // Auto-generate slug from name
    setSlug(slugify(value));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const finalSlug = slugify(slug || name);
      if (!finalSlug) {
        setError("Please enter a valid website name.");
        setLoading(false);
        return;
      }

      // 1) Check slug uniqueness
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

      // 2) Insert new website
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

      // 3) Seed default content sections
      const { error: seedError } = await supabase
        .from("website_content")
        .insert([
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
              bio: "Write something awesome about yourself here...",
              skills: ["Next.js", "Tailwind CSS"],
            },
          },
        ]);

      if (seedError) {
        setError(seedError.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      onClose();
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
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 transition hover:text-white"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold">
            P
          </div>

          <h2 className="text-xl font-semibold text-white">Create a new website</h2>

          <p className="mt-2 text-sm text-slate-400">Start building your online presence with Portiva.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Website Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Website name</label>

            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="My Portfolio"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Website URL</label>

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
            <label className="mb-2 block text-sm font-medium text-slate-200">Category</label>

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

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create website →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}