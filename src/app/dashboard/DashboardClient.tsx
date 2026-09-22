"use client";
import Footer from "@/components/Footer";

import { useState } from "react";
import Link from "next/link";
import DomainSettingsModal from "@/components/editor/DomainSettingsModal";
import CreateWebsiteModal from "./CreateWebsiteModal";

export default function DashboardClient({
  user,
  profile,
  websites,
}: {
  user: any;
  profile: any;
  websites: any[];
}) {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState<"create" | "upi">("create");

  // Domain modal state
  const [selectedSiteForDomain, setSelectedSiteForDomain] = useState<any | null>(null);

  // Evaluate active Pro status
  const isPro = Boolean(
    profile?.is_pro &&
      ((profile?.pro_until && new Date(profile.pro_until) > new Date()) ||
        (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
  );

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0d111a]/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold sm:h-9 sm:w-9">
              P
            </div>
            <span className="text-base font-bold sm:text-lg">Portiva</span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
            {!isPro && (
              <button
                onClick={() => {
                  setModalInitialStep("upi");
                  setIsCreateModalOpen(true);
                }}
                className="flex min-h-[40px] items-center whitespace-nowrap rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 sm:px-4"
              >
                <span className="sm:hidden">Upgrade</span>
                <span className="hidden sm:inline">Upgrade to Pro — ₹199</span>
              </button>
            )}

            <button
              onClick={() => {
                setModalInitialStep("create");
                setIsCreateModalOpen(true);
              }}
              className="flex min-h-[40px] items-center whitespace-nowrap rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500 sm:px-4"
            >
              + Create
              <span className="hidden sm:inline">&nbsp;Website</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">
        <h1 className="text-xl font-bold sm:text-2xl">Your Websites</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage, edit, and configure custom domains for your portfolio websites.
        </p>

        {/* Website Grid */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {websites.map((site) => (
            <div
              key={site.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d111a] p-5 shadow-xl transition hover:border-white/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-semibold text-white">{site.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      site.published
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border border-slate-500/20 bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {site.published ? "Live" : "Draft"}
                  </span>
                </div>

                <p className="mt-2 truncate font-mono text-xs text-slate-400">
                  /{site.slug}
                </p>

                {/* Show active custom domain/subdomain badge if connected */}
                {site.custom_domain && (
                  <div className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-[11px] text-indigo-300">
                    🌐 {site.custom_domain}
                  </div>
                )}

                {site.custom_subdomain && !site.custom_domain && (
                  <div className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-[11px] text-indigo-300">
                    ⚡ {site.custom_subdomain}.portiva.online
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                <Link
                  href={`/editor/${site.id}`}
                  className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-white/5 px-3 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Edit Site
                </Link>

                {/* Domain Settings Button */}
                <button
                  onClick={() => setSelectedSiteForDomain(site)}
                  className={`flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition ${
                    isPro
                      ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>🌐</span>
                  <span>Domain</span>
                  {!isPro && <span className="text-[10px]">🔒</span>}
                </button>
              </div>
            </div>
          ))}

          {websites.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
              No websites yet — hit{" "}
              <span className="font-medium text-slate-300">+ Create</span> to
              build your first one.
            </div>
          )}
        </div>
        
      </main>
      <Footer />

      {/* Create / Upgrade Modal */}
      <CreateWebsiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user.id}
        initialStep={modalInitialStep}
      />

      {/* Domain Settings Modal */}
      {selectedSiteForDomain && (
        <DomainSettingsModal
          websiteId={selectedSiteForDomain.id}
          isPro={isPro}
          currentDomain={selectedSiteForDomain.custom_domain}
          currentSubdomain={selectedSiteForDomain.custom_subdomain}
          onOpenUpgradeModal={() => {
            setModalInitialStep("upi");
            setIsCreateModalOpen(true);
          }}
          onClose={() => setSelectedSiteForDomain(null)}
        />
      )}
    </div>
  );
}