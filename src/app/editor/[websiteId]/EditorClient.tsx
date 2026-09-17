"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PortfolioView, {
  normalizeContent,
} from "@/components/portfolio/PortfolioView";
import {
  COLOR_PRESETS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  SURFACE_OPTIONS,
  THEME_PRESETS,
  isValidHex,
  resolveTheme,
  type FontId,
  type RadiusId,
  type SurfaceId,
  type ThemeConfig,
  type ThemeMode,
} from "@/lib/portfolio-theme";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Website {
  id: string;
  name: string;
  slug: string;
  category: string;
  published: boolean;
  theme_config?: ThemeConfig | null;
}

type SectionId = "hero" | "about" | "projects" | "skills" | "contact";
type TabId = SectionId | "design";

interface ProjectItem {
  title: string;
  description: string;
  url: string;
  tags: string[];
}

const SITE_ORIGIN = "https://www.portiva.online";

/* ------------------------------------------------------------------ */
/* Initial state                                                       */
/* ------------------------------------------------------------------ */

function buildInitialState(website: Website, c: Record<string, any>) {
  return {
    hero: {
      title: c.hero?.title || website.name || "",
      subtitle: c.hero?.subtitle ?? "",
      ctaText: c.hero?.ctaText ?? "Get in touch",
      availability: c.hero?.availability ?? "",
      location: c.hero?.location ?? "",
      avatarUrl: c.hero?.avatarUrl ?? "",
    },
    about: {
      heading: c.about?.heading || "About",
      bio: c.about?.bio ?? "",
    },
    projects: {
      heading: c.projects?.heading || "Selected work",
      items: (Array.isArray(c.projects?.items) ? c.projects.items : []).map(
        (item: any): ProjectItem => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
          url: item?.url ?? "",
          tags: Array.isArray(item?.tags) ? item.tags : [],
        }),
      ) as ProjectItem[],
    },
    skills: {
      heading: c.skills?.heading || "What I work with",
      input: Array.isArray(c.skills?.list) ? c.skills.list.join(", ") : "",
    },
    contact: {
      heading: c.contact?.heading || "Get in touch",
      message: c.contact?.message ?? "",
      email: c.contact?.email ?? "",
      linkedin: c.contact?.linkedin ?? "",
      github: c.contact?.github ?? "",
      website: c.contact?.website ?? "",
      twitter: c.contact?.twitter ?? "",
      resume: c.contact?.resume ?? "",
    },
    theme: {
      preset: website.theme_config?.preset,
      primaryColor: website.theme_config?.primaryColor ?? "#6366f1",
      fontFamily: (website.theme_config?.fontFamily ?? "sans") as FontId,
      mode: (website.theme_config?.mode ?? "dark") as ThemeMode,
      radius: (website.theme_config?.radius ?? "soft") as RadiusId,
      surface: (website.theme_config?.surface ?? "halo") as SurfaceId,
    } as ThemeConfig,
  };
}

const parseList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Icon({
  children,
  className = "h-4 w-4",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "hero",
    label: "Intro",
    icon: <path d="M4 6h16M4 12h10M4 18h7" />,
  },
  {
    id: "about",
    label: "About",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" />
      </>
    ),
  },
  {
    id: "projects",
    label: "Work",
    icon: <rect x="4" y="6" width="16" height="13" rx="2" />,
  },
  {
    id: "skills",
    label: "Skills",
    icon: <path d="M6 20l3-14 3 14M15 6l3 14M9 13h6" />,
  },
  {
    id: "contact",
    label: "Contact",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4.5 6.5l7.5 6 7.5-6" />
      </>
    ),
  },
  {
    id: "design",
    label: "Design",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="9.2" cy="10" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="14.2" cy="9.2" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="14" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

const inputClass =
  "w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[15px] text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/25";

function Field({
  label,
  hint,
  children,
  counter,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="block text-sm font-medium text-slate-200">{label}</label>
        {counter && <span className="text-[11px] text-slate-500">{counter}</span>}
      </div>
      {children}
      {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
        active
          ? "border-indigo-400 bg-indigo-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export default function EditorClient({
  website,
  initialContent,
}: {
  website: Website;
  initialContent: Record<string, any>;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const init = useMemo(
    () => buildInitialState(website, initialContent ?? {}),
    // Intentionally computed once: this is the baseline we diff against.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [tab, setTab] = useState<TabId>("hero");
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<"phone" | "desktop">("desktop");
  const [menuOpen, setMenuOpen] = useState(false);

  const [hero, setHero] = useState(init.hero);
  const [about, setAbout] = useState(init.about);
  const [projects, setProjects] = useState(init.projects);
  const [skills, setSkills] = useState(init.skills);
  const [contact, setContact] = useState(init.contact);
  const [theme, setTheme] = useState<ThemeConfig>(init.theme);

  const [isPublished, setIsPublished] = useState(website.published);
  const [savingTabs, setSavingTabs] = useState<TabId[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast(null),
      type === "error" ? 6000 : 2800,
    );
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const skillList = useMemo(() => parseList(skills.input), [skills.input]);

  /* ---------------- payloads + change tracking ---------------- */

  const payloads = useMemo(
    () => ({
      hero,
      about,
      projects,
      skills: { heading: skills.heading, list: skillList },
      contact,
    }),
    [hero, about, projects, skills.heading, skillList, contact],
  );

  const [baseline, setBaseline] = useState<Record<string, string>>(() => ({
    hero: JSON.stringify(init.hero),
    about: JSON.stringify(init.about),
    projects: JSON.stringify(init.projects),
    skills: JSON.stringify({
      heading: init.skills.heading,
      list: parseList(init.skills.input),
    }),
    contact: JSON.stringify(init.contact),
    design: JSON.stringify(init.theme),
  }));

  const dirty = useMemo(() => {
    const map: Record<TabId, boolean> = {
      hero: JSON.stringify(payloads.hero) !== baseline.hero,
      about: JSON.stringify(payloads.about) !== baseline.about,
      projects: JSON.stringify(payloads.projects) !== baseline.projects,
      skills: JSON.stringify(payloads.skills) !== baseline.skills,
      contact: JSON.stringify(payloads.contact) !== baseline.contact,
      design: JSON.stringify(theme) !== baseline.design,
    };
    return map;
  }, [payloads, theme, baseline]);

  const dirtyTabs = (Object.keys(dirty) as TabId[]).filter((id) => dirty[id]);
  const busy = savingTabs.length > 0;

  /* ---------------- saving ---------------- */

  const saveTabs = useCallback(
    async (tabs: TabId[]) => {
      if (tabs.length === 0 || busy) return;
      setSavingTabs(tabs);

      const now = new Date().toISOString();
      const sections = tabs.filter((t): t is SectionId => t !== "design");
      const errors: string[] = [];

      if (sections.length > 0) {
        const { error } = await supabase.from("website_content").upsert(
          sections.map((id) => ({
            website_id: website.id,
            section: id,
            content: payloads[id],
            updated_at: now,
          })),
          { onConflict: "website_id,section" },
        );
        if (error) errors.push(error.message);
      }

      if (tabs.includes("design")) {
        const { error } = await supabase
          .from("websites")
          .update({ theme_config: theme, updated_at: now })
          .eq("id", website.id);
        if (error) errors.push(error.message);
      }

      setSavingTabs([]);

      if (errors.length > 0) {
        notify("error", `Couldn't save: ${errors[0]}. Your edits are still here — try again.`);
        return;
      }

      setBaseline((prev) => {
        const next = { ...prev };
        for (const id of tabs) {
          next[id] =
            id === "design"
              ? JSON.stringify(theme)
              : JSON.stringify(payloads[id as SectionId]);
        }
        return next;
      });

      notify(
        "success",
        tabs.length > 1 ? "All changes saved" : "Saved",
      );
      router.refresh();
    },
    [busy, notify, payloads, router, supabase, theme, website.id],
  );

  // Cmd/Ctrl + S saves everything that changed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveTabs(dirtyTabs);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveTabs, dirtyTabs]);

  // Don't let unsaved work disappear on a stray tab close.
  useEffect(() => {
    if (dirtyTabs.length === 0) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirtyTabs.length]);

  /* ---------------- publish + share ---------------- */

  const publicUrl = `${SITE_ORIGIN}/${website.slug}`;

  async function togglePublish() {
    setPublishing(true);
    const next = !isPublished;

    const { error } = await supabase
      .from("websites")
      .update({ published: next, updated_at: new Date().toISOString() })
      .eq("id", website.id);

    setPublishing(false);
    setMenuOpen(false);

    if (error) {
      notify("error", `Couldn't change visibility: ${error.message}`);
      return;
    }

    setIsPublished(next);
    notify(
      "success",
      next ? "Your site is live" : "Your site is hidden from visitors",
    );
    router.refresh();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      notify("success", "Link copied");
    } catch {
      notify("error", `Copy didn't work. Your link is ${publicUrl}`);
    }
    setMenuOpen(false);
  }

  /* ---------------- live preview data ---------------- */

  const previewContent = useMemo(
    () =>
      normalizeContent(
        {
          hero,
          about,
          projects,
          skills: { heading: skills.heading, list: skillList },
          contact,
        },
        website.name,
      ),
    [hero, about, projects, skills.heading, skillList, contact, website.name],
  );

  const activePreset = THEME_PRESETS.find((p) => {
    const c = p.config;
    return (
      c.primaryColor === theme.primaryColor &&
      c.fontFamily === theme.fontFamily &&
      c.mode === theme.mode &&
      c.radius === theme.radius &&
      c.surface === theme.surface
    );
  });

  const updateTheme = (patch: Partial<ThemeConfig>) =>
    setTheme((prev) => ({ ...prev, ...patch }));

  /* ---------------- project helpers ---------------- */

  const updateProject = (index: number, patch: Partial<ProjectItem>) =>
    setProjects((prev) => ({
      ...prev,
      items: prev.items.map((item: ProjectItem, i: number) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));

  const moveProject = (index: number, delta: number) =>
    setProjects((prev) => {
      const items = [...prev.items];
      const target = index + delta;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, items };
    });

  const removeProject = (index: number) =>
    setProjects((prev) => ({
      ...prev,
      items: prev.items.filter((_: ProjectItem, i: number) => i !== index),
    }));

  /* ---------------- render ---------------- */

  const saveLabel = busy
    ? "Saving…"
    : dirtyTabs.length === 0
      ? "All changes saved"
      : dirtyTabs.length === 1 && dirtyTabs[0] === tab
        ? "Save changes"
        : `Save ${dirtyTabs.length} changes`;

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#090c13] font-sans text-slate-100">
      {/* ---------- top bar ---------- */}
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-[#0d111a]">
        <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to your sites"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 sm:w-auto sm:px-3.5"
            >
              <Icon>
                <path d="M15 5l-7 7 7 7" />
              </Icon>
              <span className="ml-1.5 hidden text-xs font-medium sm:inline">
                Your sites
              </span>
            </Link>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white">
                {website.name}
              </h1>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPublished ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <p className="truncate font-mono text-[11px] text-slate-400">
                  {isPublished ? `portiva.online/${website.slug}` : "Not published yet"}
                </p>
              </div>
            </div>
          </div>

          {/* desktop actions */}
          <div className="hidden items-center gap-2 sm:flex">
            {toast && (
              <span
                role="status"
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  toast.type === "success"
                    ? "border-emerald-800/70 bg-emerald-950/70 text-emerald-300"
                    : "border-rose-800/70 bg-rose-950/70 text-rose-300"
                }`}
              >
                {toast.text}
              </span>
            )}

            <button
              onClick={copyLink}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Icon className="h-3.5 w-3.5">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
              </Icon>
              Copy link
            </button>

            {isPublished && (
              <a
                href={`/${website.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <Icon className="h-3.5 w-3.5">
                  <path d="M14 5h5v5M19 5l-8 8M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-2" />
                </Icon>
                Open site
              </a>
            )}

            <button
              onClick={togglePublish}
              disabled={publishing}
              className={`h-10 rounded-xl px-4 text-xs font-semibold transition disabled:opacity-50 ${
                isPublished
                  ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              {publishing
                ? "Working…"
                : isPublished
                  ? "Unpublish"
                  : "Publish site"}
            </button>
          </div>

          {/* mobile actions */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => void saveTabs(dirtyTabs)}
              disabled={busy || dirtyTabs.length === 0}
              className="h-10 rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white disabled:bg-white/5 disabled:text-slate-500"
            >
              {busy ? "Saving…" : dirtyTabs.length ? "Save" : "Saved"}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Site actions"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
            >
              <Icon className="h-5 w-5">
                <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
              </Icon>
            </button>
          </div>
        </div>

        {toast && (
          <div
            role="status"
            className={`px-4 pb-2 text-xs font-medium sm:hidden ${
              toast.type === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {toast.text}
          </div>
        )}

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20 sm:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-3 top-16 z-30 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#12151f] shadow-2xl sm:hidden">
              <button
                onClick={copyLink}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-slate-200 active:bg-white/5"
              >
                <Icon className="h-4 w-4 text-slate-400">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                </Icon>
                Copy link
              </button>

              {isPublished && (
                <a
                  href={`/${website.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3.5 text-left text-sm text-slate-200 active:bg-white/5"
                >
                  <Icon className="h-4 w-4 text-slate-400">
                    <path d="M14 5h5v5M19 5l-8 8M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-2" />
                  </Icon>
                  Open site
                </a>
              )}

              <button
                onClick={togglePublish}
                disabled={publishing}
                className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3.5 text-left text-sm font-medium disabled:opacity-50"
              >
                <span className={isPublished ? "text-amber-300" : "text-emerald-400"}>
                  {publishing
                    ? "Working…"
                    : isPublished
                      ? "Unpublish site"
                      : "Publish site"}
                </span>
              </button>
            </div>
          </>
        )}
      </header>

      {/* ---------- mobile pane switch ---------- */}
      <div className="shrink-0 border-b border-white/10 bg-[#0d111a] px-3 py-2 lg:hidden">
        <div className="flex rounded-xl bg-white/5 p-1">
          {(["edit", "preview"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setPane(v)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                pane === v ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- split layout ---------- */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside
          className={`min-h-0 w-full flex-col border-white/10 bg-[#0b0f17] lg:flex lg:w-[440px] lg:shrink-0 lg:border-r ${
            pane === "edit" ? "flex" : "hidden"
          }`}
        >
          {/* tabs */}
          <div className="shrink-0 border-b border-white/10 bg-[#0d111a]">
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto px-3 py-2.5 [-webkit-overflow-scrolling:touch]">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id}
                  className={`flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition ${
                    tab === t.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <Icon>{t.icon}</Icon>
                  {t.label}
                  {dirty[t.id] && (
                    <span
                      title="Unsaved changes"
                      className={`h-1.5 w-1.5 rounded-full ${
                        tab === t.id ? "bg-white" : "bg-amber-400"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* forms */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 pb-32 sm:p-5 lg:p-6 lg:pb-6">
            {tab === "hero" && (
              <div className="space-y-5">
                <Field
                  label="Headline"
                  hint="Your name, or the one line you want remembered."
                  counter={`${hero.title.length}/70`}
                >
                  <input
                    className={inputClass}
                    value={hero.title}
                    maxLength={70}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  />
                </Field>

                <Field
                  label="Short intro"
                  hint="Two sentences is plenty. Say what you do and who it's for."
                  counter={`${hero.subtitle.length}/220`}
                >
                  <textarea
                    rows={3}
                    maxLength={220}
                    className={`${inputClass} resize-y`}
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Status badge" hint="Leave empty to hide it.">
                    <input
                      className={inputClass}
                      placeholder="Open to work"
                      value={hero.availability}
                      onChange={(e) =>
                        setHero({ ...hero, availability: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Location">
                    <input
                      className={inputClass}
                      placeholder="Bengaluru, India"
                      value={hero.location}
                      onChange={(e) => setHero({ ...hero, location: e.target.value })}
                    />
                  </Field>
                </div>

                <Field
                  label="Photo URL"
                  hint="Any public image link. Square images look best."
                >
                  <input
                    className={inputClass}
                    placeholder="https://…/photo.jpg"
                    value={hero.avatarUrl}
                    onChange={(e) => setHero({ ...hero, avatarUrl: e.target.value })}
                  />
                </Field>

                <Field label="Button label" hint="Scrolls visitors to your contact links.">
                  <input
                    className={inputClass}
                    placeholder="Get in touch"
                    value={hero.ctaText}
                    onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                  />
                </Field>
              </div>
            )}

            {tab === "about" && (
              <div className="space-y-5">
                <Field label="Section title">
                  <input
                    className={inputClass}
                    value={about.heading}
                    onChange={(e) => setAbout({ ...about, heading: e.target.value })}
                  />
                </Field>

                <Field
                  label="Your story"
                  hint="Write like you'd explain your work to a friend. Line breaks are kept."
                  counter={`${about.bio.trim() ? about.bio.trim().split(/\s+/).length : 0} words`}
                >
                  <textarea
                    rows={9}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="I design and build…"
                    value={about.bio}
                    onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                  />
                </Field>
              </div>
            )}

            {tab === "projects" && (
              <div className="space-y-5">
                <Field label="Section title">
                  <input
                    className={inputClass}
                    value={projects.heading}
                    onChange={(e) =>
                      setProjects({ ...projects, heading: e.target.value })
                    }
                  />
                </Field>

                {projects.items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                    <p className="text-sm text-slate-300">Nothing here yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Add two or three things you're proud of. Links are optional.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {projects.items.map((item: ProjectItem, index: number) => (
                    <div
                      key={index}
                      className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          {item.title || `Project ${index + 1}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Move up"
                            disabled={index === 0}
                            onClick={() => moveProject(index, -1)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 disabled:opacity-30"
                          >
                            <Icon className="h-3.5 w-3.5">
                              <path d="M12 19V5M5 12l7-7 7 7" />
                            </Icon>
                          </button>
                          <button
                            type="button"
                            aria-label="Move down"
                            disabled={index === projects.items.length - 1}
                            onClick={() => moveProject(index, 1)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 disabled:opacity-30"
                          >
                            <Icon className="h-3.5 w-3.5">
                              <path d="M12 5v14M5 12l7 7 7-7" />
                            </Icon>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProject(index)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <input
                        className={inputClass}
                        placeholder="Project name"
                        value={item.title}
                        onChange={(e) =>
                          updateProject(index, { title: e.target.value })
                        }
                      />

                      <textarea
                        rows={2}
                        className={`${inputClass} resize-y`}
                        placeholder="What it is, and what you did on it"
                        value={item.description}
                        onChange={(e) =>
                          updateProject(index, { description: e.target.value })
                        }
                      />

                      <input
                        className={inputClass}
                        placeholder="https://example.com (optional)"
                        value={item.url}
                        onChange={(e) => updateProject(index, { url: e.target.value })}
                      />

                      <input
                        className={inputClass}
                        placeholder="Tags: Next.js, Supabase"
                        value={item.tags.join(", ")}
                        onChange={(e) =>
                          updateProject(index, { tags: parseList(e.target.value) })
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setProjects({
                      ...projects,
                      items: [
                        ...projects.items,
                        { title: "", description: "", url: "", tags: [] },
                      ],
                    })
                  }
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-3 text-sm font-medium text-indigo-300 hover:bg-white/5"
                >
                  <Icon>
                    <path d="M12 5v14M5 12h14" />
                  </Icon>
                  Add a project
                </button>
              </div>
            )}

            {tab === "skills" && (
              <div className="space-y-5">
                <Field label="Section title">
                  <input
                    className={inputClass}
                    value={skills.heading}
                    onChange={(e) => setSkills({ ...skills, heading: e.target.value })}
                  />
                </Field>

                <Field
                  label="Skills"
                  hint="Separate with commas. Eight to twelve reads better than thirty."
                  counter={`${skillList.length} added`}
                >
                  <textarea
                    rows={4}
                    className={`${inputClass} resize-y`}
                    placeholder="React, TypeScript, Product design"
                    value={skills.input}
                    onChange={(e) => setSkills({ ...skills, input: e.target.value })}
                  />
                </Field>

                {skillList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skillList.map((skill, i) => (
                      <button
                        key={`${skill}-${i}`}
                        type="button"
                        onClick={() =>
                          setSkills({
                            ...skills,
                            input: skillList.filter((_, j) => j !== i).join(", "),
                          })
                        }
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:border-rose-500/40 hover:text-rose-300"
                      >
                        {skill}
                        <Icon className="h-3 w-3 opacity-50 group-hover:opacity-100">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </Icon>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "contact" && (
              <div className="space-y-5">
                <Field label="Section title">
                  <input
                    className={inputClass}
                    value={contact.heading}
                    onChange={(e) => setContact({ ...contact, heading: e.target.value })}
                  />
                </Field>

                <Field label="Invitation" hint="One line above your links.">
                  <textarea
                    rows={2}
                    className={`${inputClass} resize-y`}
                    placeholder="Taking on freelance work from March."
                    value={contact.message}
                    onChange={(e) => setContact({ ...contact, message: e.target.value })}
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="you@example.com"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  />
                </Field>

                {(
                  [
                    ["linkedin", "LinkedIn", "https://linkedin.com/in/…"],
                    ["github", "GitHub", "https://github.com/…"],
                    ["twitter", "X", "https://x.com/…"],
                    ["website", "Personal site or blog", "https://…"],
                    ["resume", "Résumé link", "https://…/resume.pdf"],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <Field key={key} label={label}>
                    <input
                      type="url"
                      className={inputClass}
                      placeholder={placeholder}
                      value={contact[key]}
                      onChange={(e) =>
                        setContact({ ...contact, [key]: e.target.value })
                      }
                    />
                  </Field>
                ))}

                <p className="text-xs text-slate-500">
                  Empty fields are skipped, so your site never shows a broken link.
                </p>
              </div>
            )}

            {tab === "design" && (
              <div className="space-y-7">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Themes</p>
                    <p className="text-xs text-slate-500">
                      A full look in one tap. Adjust anything below afterwards.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {THEME_PRESETS.map((preset) => {
                      const p = resolveTheme(preset.config);
                      return (
                        <OptionCard
                          key={preset.id}
                          active={activePreset?.id === preset.id}
                          onClick={() =>
                            setTheme({ preset: preset.id, ...preset.config })
                          }
                          className="p-0 overflow-hidden"
                        >
                          <div
                            className="flex h-16 items-end gap-1.5 p-2.5"
                            style={{
                              background: p.vars["--p-bg"],
                              backgroundImage: p.backdrop ?? undefined,
                            }}
                          >
                            <span
                              className="h-6 w-6 rounded-full"
                              style={{ background: p.vars["--p-accent"] }}
                            />
                            <span
                              className="h-2.5 flex-1 rounded-full"
                              style={{ background: p.vars["--p-surface-strong"] }}
                            />
                          </div>
                          <div className="px-2.5 py-2">
                            <p className="text-xs font-semibold text-white">
                              {preset.name}
                            </p>
                            <p className="text-[11px] leading-tight text-slate-500">
                              {preset.description}
                            </p>
                          </div>
                        </OptionCard>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium text-slate-200">Background</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["dark", "light"] as ThemeMode[]).map((mode) => (
                      <OptionCard
                        key={mode}
                        active={(theme.mode ?? "dark") === mode}
                        onClick={() => updateTheme({ mode, preset: undefined })}
                      >
                        <span
                          className="mb-2 block h-8 w-full rounded-lg border border-white/10"
                          style={{
                            background: mode === "dark" ? "#080b12" : "#fbfbfd",
                          }}
                        />
                        <span className="text-xs font-medium capitalize text-slate-200">
                          {mode}
                        </span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium text-slate-200">Accent colour</p>

                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.name}
                        aria-label={c.name}
                        onClick={() =>
                          updateTheme({ primaryColor: c.value, preset: undefined })
                        }
                        className={`flex h-11 items-center justify-center rounded-xl border transition ${
                          theme.primaryColor === c.value
                            ? "border-white/60"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{ background: c.value }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Pick a custom colour"
                      value={
                        isValidHex(theme.primaryColor ?? "")
                          ? theme.primaryColor
                          : "#6366f1"
                      }
                      onChange={(e) =>
                        updateTheme({ primaryColor: e.target.value, preset: undefined })
                      }
                      className="h-11 w-12 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                    />
                    <input
                      className={`${inputClass} font-mono`}
                      value={theme.primaryColor ?? ""}
                      onChange={(e) =>
                        updateTheme({ primaryColor: e.target.value, preset: undefined })
                      }
                      placeholder="#6366f1"
                    />
                  </div>
                  {!isValidHex(theme.primaryColor ?? "") && (
                    <p className="text-xs text-amber-400">
                      That isn't a hex colour yet, so indigo is being used. Try
                      something like #2563eb.
                    </p>
                  )}
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium text-slate-200">Typeface</p>
                  <div className="space-y-2">
                    {FONT_OPTIONS.map((font) => (
                      <OptionCard
                        key={font.id}
                        active={(theme.fontFamily ?? "sans") === font.id}
                        onClick={() =>
                          updateTheme({ fontFamily: font.id, preset: undefined })
                        }
                        className="w-full"
                      >
                        <span
                          className="block text-base text-white"
                          style={{ fontFamily: font.heading }}
                        >
                          {font.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">
                          {font.note}
                        </span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium text-slate-200">Corners</p>
                  <div className="grid grid-cols-3 gap-2">
                    {RADIUS_OPTIONS.map((r) => (
                      <OptionCard
                        key={r.id}
                        active={(theme.radius ?? "soft") === r.id}
                        onClick={() => updateTheme({ radius: r.id, preset: undefined })}
                      >
                        <span
                          className="mb-2 block h-8 w-full border border-white/20 bg-white/5"
                          style={{ borderRadius: r.md }}
                        />
                        <span className="text-xs text-slate-300">{r.name}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium text-slate-200">Texture</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SURFACE_OPTIONS.map((s) => {
                      const p = resolveTheme({ ...theme, surface: s.id });
                      return (
                        <OptionCard
                          key={s.id}
                          active={(theme.surface ?? "halo") === s.id}
                          onClick={() =>
                            updateTheme({ surface: s.id, preset: undefined })
                          }
                        >
                          <span
                            className="mb-2 block h-10 w-full rounded-lg border border-white/10"
                            style={{
                              background: p.vars["--p-bg"],
                              backgroundImage: p.backdrop ?? undefined,
                            }}
                          />
                          <span className="text-xs font-medium text-slate-200">
                            {s.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-tight text-slate-500">
                            {s.note}
                          </span>
                        </OptionCard>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* save bar */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 p-3 lg:pointer-events-auto lg:static lg:border-t lg:border-white/10 lg:bg-[#0d111a] lg:p-4">
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => void saveTabs(dirtyTabs)}
                disabled={busy || dirtyTabs.length === 0}
                className="flex-1 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none lg:py-3"
              >
                {saveLabel}
              </button>
              <span className="hidden text-[11px] text-slate-500 lg:block">
                ⌘S
              </span>
            </div>
          </div>
        </aside>

        {/* preview */}
        <main
          className={`min-h-0 flex-1 flex-col bg-[#05070c] ${
            pane === "preview" ? "flex" : "hidden"
          } lg:flex`}
        >
          <div className="hidden shrink-0 items-center justify-between border-b border-white/10 px-4 py-2 lg:flex">
            <p className="text-xs text-slate-500">
              Live preview — this is exactly what visitors see
            </p>
            <div className="flex rounded-lg bg-white/5 p-0.5">
              {(["desktop", "phone"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                    device === d ? "bg-white/10 text-white" : "text-slate-500"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0 lg:p-6">
            <div
              className={`mx-auto w-full overflow-hidden bg-[var(--p-bg)] lg:rounded-2xl lg:border lg:border-white/10 lg:shadow-2xl ${
                device === "phone" ? "lg:max-w-[420px]" : "lg:max-w-4xl"
              }`}
            >
              <PortfolioView
                name={website.name}
                category={website.category}
                content={previewContent}
                theme={theme}
                variant="preview"
                showBranding
              />
            </div>

            {!isPublished && (
              <p className="px-4 py-6 text-center text-xs text-slate-500 lg:pb-0">
                This site isn't published yet. Hit Publish when you're ready —
                you can unpublish any time.
              </p>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}