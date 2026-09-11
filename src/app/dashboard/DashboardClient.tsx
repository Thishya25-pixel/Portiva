"use client";

import { useState } from "react";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import CreateWebsiteModal from "./CreateWebsiteModal";

export default function DashboardClient({
  user,
  initialWebsites,
}: {
  user: any;
  initialWebsites: any[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const firstName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      {/* Navbar */}
      <header className="relative border-b border-white/[0.06] bg-[#080b12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/20">
              P
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Portiva
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:block"
            >
              + New website
            </button>

            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Welcome section */}
        <section className="mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Your workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
            <span className="ml-2">👋</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Create, manage, and publish your websites from one place.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">Total websites</p>

            <p className="mt-2 text-3xl font-bold">
              {initialWebsites.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">Published</p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {initialWebsites.filter((site) => site.published).length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">Drafts</p>

            <p className="mt-2 text-3xl font-bold text-amber-400">
              {initialWebsites.filter((site) => !site.published).length}
            </p>
          </div>
        </section>

        {/* Websites header */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your websites</h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage everything you've created.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200"
            >
              + Create website
            </button>
          </div>

          {/* Empty State */}
          {initialWebsites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                ✦
              </div>

              <h3 className="text-lg font-semibold">
                Your first website starts here
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Create a beautiful website in minutes. No complicated setup
                required.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Create your first website →
              </button>
            </div>
          ) : (
            /* Website Grid */
            <div className="grid gap-5 md:grid-cols-2">
              {initialWebsites.map((site) => (
                <div
                  key={site.id}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition hover:border-indigo-500/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                          {site.category}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            site.published
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {site.published ? "Published" : "Draft"}
                        </span>
                      </div>

                      <h3 className="truncate text-xl font-semibold text-white">
                        {site.name}
                      </h3>

                      <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-indigo-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        portiva.online/{site.slug}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/editor/${site.id}`}
                        className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200"
                      >
                        Edit site →
                      </Link>

                      <a
                        href={`/${site.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        View ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.id}
      />
    </main>
  );
}