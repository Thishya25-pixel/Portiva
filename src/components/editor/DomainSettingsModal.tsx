"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DomainSettingsModal({
  websiteId,
  isPro,
  currentDomain,
  currentSubdomain,
  onOpenUpgradeModal,
  onClose,
}: {
  websiteId: string;
  isPro: boolean;
  currentDomain?: string;
  currentSubdomain?: string;
  onOpenUpgradeModal: () => void;
  onClose: () => void;
}) {
  const [domain, setDomain] = useState(currentDomain || "");
  const [subdomain, setSubdomain] = useState(currentSubdomain || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  async function handleSaveDomains(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // BLOCK FREE USERS
    if (!isPro) {
      setError("Custom domains and subdomains are Pro features. Upgrade to unlock!");
      return;
    }

    setLoading(true);

    try {
      const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
      const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

      const { error: updateError } = await supabase
        .from("websites")
        .update({
          custom_domain: cleanDomain || null,
          custom_subdomain: cleanSubdomain || null,
        })
        .eq("id", websiteId);

      if (updateError) {
        if (updateError.code === "23505") {
          setError("This domain or subdomain is already taken by another site.");
        } else {
          setError(updateError.message);
        }
        return;
      }

      setSuccess("Domain settings saved successfully!");
    } catch (err: any) {
      setError("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d111a] p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold">Domain & URL Settings</h2>
        <p className="mt-1 text-xs text-slate-400">
          Configure custom domains and subdomains for your website.
        </p>

        {/* NON-PRO BANNER LOCK */}
        {!isPro && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
            <span className="text-2xl">🔒</span>
            <p className="mt-2 text-sm font-medium text-amber-200">
              Custom Domains are locked on the Free plan
            </p>
            <p className="mt-1 text-xs text-amber-400/80">
              Upgrade to Pro (₹199) to connect custom domains (`yourname.com`) and clean subdomains (`yourname.portiva.online`).
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenUpgradeModal();
              }}
              className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Upgrade to Pro — ₹199 ⚡
            </button>
          </div>
        )}

        {/* FORM FOR PRO USERS */}
        <form onSubmit={handleSaveDomains} className="mt-6 space-y-5">
          {/* Custom Subdomain */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Free Portiva Subdomain
            </label>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              <input
                type="text"
                disabled={!isPro}
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="rahul"
                className="w-full bg-transparent outline-none disabled:opacity-50"
              />
              <span className="text-xs text-slate-500">.portiva.online</span>
            </div>
          </div>

          {/* Custom External Domain */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Own Custom Domain (`yourdomain.com`)
            </label>
            <input
              type="text"
              disabled={!isPro}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. rahul.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
            />

            {/* DNS Instructions if custom domain entered */}
            {isPro && domain && (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-200">DNS Setup Instructions:</p>
                <p className="mt-1">Add these records at your registrar (GoDaddy, Namecheap):</p>
                <div className="mt-2 space-y-1 font-mono text-[10px] text-indigo-300">
                  <div>Type: <b className="text-white">A</b> | Name: <b className="text-white">@</b> | Value: <b className="text-white">76.76.21.21</b></div>
                  <div>Type: <b className="text-white">CNAME</b> | Name: <b className="text-white">www</b> | Value: <b className="text-white">cname.vercel-dns.com</b></div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{success}</p>}

          {isPro && (
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}