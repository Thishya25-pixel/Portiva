"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Website {
  id: string;
  name: string;
  slug: string;
  category: string;
  published: boolean;
  theme_config?: {
    primaryColor?: string;
    fontFamily?: "sans" | "serif" | "mono";
  };
}

const COLOR_PRESETS = [
  { name: "Neon Indigo", value: "#6366f1" },
  { name: "Electric Blue", value: "#2563eb" },
  { name: "Emerald Green", value: "#10b981" },
  { name: "Violet Glow", value: "#8b5cf6" },
  { name: "Sunset Amber", value: "#f59e0b" },
  { name: "Rose Crimson", value: "#f43f5e" },
];

const FONT_OPTIONS = [
  { id: "sans", name: "Modern Sans-Serif", cssClass: "font-sans" },
  { id: "serif", name: "Editorial Serif", cssClass: "font-serif" },
  { id: "mono", name: "Technical Monospace", cssClass: "font-mono" },
];

export default function EditorClient({
  website,
  initialContent,
}: {
  website: Website;
  initialContent: Record<string, any>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<
    "hero" | "about" | "projects" | "skills" | "contact" | "theme"
  >("hero");
  const [isPublished, setIsPublished] = useState(website.published);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form States
  const [heroContent, setHeroContent] = useState({
    title: initialContent.hero?.title || website.name || "",
    subtitle: initialContent.hero?.subtitle || "Welcome to my official portfolio.",
    ctaText: initialContent.hero?.ctaText || "Get In Touch",
  });

  const [aboutContent, setAboutContent] = useState({
    bio: initialContent.about?.bio || "Passionate software builder creating modern digital experiences.",
  });

  const [projectsContent, setProjectsContent] = useState({
    heading: initialContent.projects?.heading || "Featured Projects",
    items: initialContent.projects?.items || [
      {
        title: "Portiva Showcase",
        description: "Built using Next.js, Supabase, and Tailwind CSS.",
        url: "https://www.portiva.online",
      },
    ],
  });

  const [skillsContent, setSkillsContent] = useState({
    skillsInput:
      initialContent.skills?.list?.join(", ") ||
      "React, Next.js, TypeScript, Tailwind CSS, Supabase",
  });

  const [contactContent, setContactContent] = useState({
    email: initialContent.contact?.email || "",
    linkedin: initialContent.contact?.linkedin || "",
    github: initialContent.contact?.github || "",
  });

  const [themeConfig, setThemeConfig] = useState({
    primaryColor: website.theme_config?.primaryColor || "#6366f1",
    fontFamily: (website.theme_config?.fontFamily || "sans") as
      | "sans"
      | "serif"
      | "mono",
  });

  // Save Section Data to Supabase
  async function handleSaveSection(sectionName: string, contentData: object) {
    setSaving(true);
    setStatusMessage(null);

    const { error } = await supabase.from("website_content").upsert(
      {
        website_id: website.id,
        section: sectionName,
        content: contentData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "website_id,section" }
    );

    setSaving(false);

    if (error) {
      setStatusMessage({
        type: "error",
        text: `Failed to save ${sectionName}: ${error.message}`,
      });
    } else {
      setStatusMessage({
        type: "success",
        text: `${sectionName.toUpperCase()} section saved!`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    }
  }

  // Save Theme Options to Supabase
  async function handleSaveTheme() {
    setSaving(true);
    setStatusMessage(null);

    const { error } = await supabase
      .from("websites")
      .update({
        theme_config: themeConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", website.id);

    setSaving(false);

    if (error) {
      setStatusMessage({
        type: "error",
        text: `Failed to save theme: ${error.message}`,
      });
    } else {
      setStatusMessage({
        type: "success",
        text: "Theme preferences updated!",
      });
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    }
  }

  // Toggle Publish / Unpublish Status
  async function handleTogglePublish() {
    setPublishing(true);
    const newStatus = !isPublished;

    const { error } = await supabase
      .from("websites")
      .update({ published: newStatus, updated_at: new Date().toISOString() })
      .eq("id", website.id);

    setPublishing(false);

    if (error) {
      setStatusMessage({ type: "error", text: `Publish error: ${error.message}` });
    } else {
      setIsPublished(newStatus);
      setStatusMessage({
        type: "success",
        text: newStatus ? "Website published live!" : "Website unpublished.",
      });
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    }
  }

  const parsedSkills = skillsContent.skillsInput
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const previewFontClass =
    themeConfig.fontFamily === "serif"
      ? "font-serif"
      : themeConfig.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <div className="flex h-screen w-full flex-col bg-[#080b12] text-slate-100 font-sans">
      {/* Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0d111a] px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
          <div>
            <h1 className="text-base font-bold text-white">{website.name}</h1>
            <p className="text-xs text-indigo-400 font-mono">portiva.online/{website.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span
              className={`text-xs px-3 py-1 rounded-md font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-rose-950 text-rose-400 border border-rose-800"
              }`}
            >
              {statusMessage.text}
            </span>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://www.portiva.online/${website.slug}`);
              setStatusMessage({ type: "success", text: "Link copied to clipboard!" });
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            📋 Copy Link
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
              isPublished
                ? "bg-amber-600 text-white hover:bg-amber-500"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            } disabled:opacity-50`}
          >
            {publishing ? "Updating..." : isPublished ? "Unpublish Site" : "Publish Site"}
          </button>

          {isPublished && (
            <a
              href={`/${website.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              View Live ↗
            </a>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-full max-w-md border-r border-white/10 bg-[#0b0f17] flex flex-col">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-[#0d111a] px-2 pt-2 gap-1 overflow-x-auto">
            {(["hero", "about", "projects", "skills", "contact", "theme"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-t-xl py-2 px-3 text-xs font-semibold capitalize transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#0b0f17] text-indigo-400 border-t-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab === "theme" ? "🎨 Theme" : tab}
              </button>
            ))}
          </div>

          {/* Form Options */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* HERO TAB */}
            {activeTab === "hero" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("hero", heroContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
                  <input
                    type="text"
                    value={heroContent.title}
                    onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle / Bio Lead</label>
                  <textarea
                    rows={3}
                    value={heroContent.subtitle}
                    onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Call-To-Action Button Label</label>
                  <input
                    type="text"
                    value={heroContent.ctaText}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving Hero..." : "Save Hero Section"}
                </button>
              </form>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("about", aboutContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Bio</label>
                  <textarea
                    rows={6}
                    value={aboutContent.bio}
                    onChange={(e) => setAboutContent({ ...aboutContent, bio: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Describe your background and expertise..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving About..." : "Save About Section"}
                </button>
              </form>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("projects", projectsContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={projectsContent.heading}
                    onChange={(e) => setProjectsContent({ ...projectsContent, heading: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">Project Cards</label>
                  {projectsContent.items.map((item: any, index: number) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...projectsContent.items];
                          newItems[index].title = e.target.value;
                          setProjectsContent({ ...projectsContent, items: newItems });
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...projectsContent.items];
                          newItems[index].description = e.target.value;
                          setProjectsContent({ ...projectsContent, items: newItems });
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-xs text-white"
                      />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={item.url}
                        onChange={(e) => {
                          const newItems = [...projectsContent.items];
                          newItems[index].url = e.target.value;
                          setProjectsContent({ ...projectsContent, items: newItems });
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-xs text-white"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setProjectsContent({
                        ...projectsContent,
                        items: [...projectsContent.items, { title: "", description: "", url: "" }],
                      })
                    }
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    + Add New Project
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving Projects..." : "Save Projects Section"}
                </button>
              </form>
            )}

            {/* SKILLS TAB */}
            {activeTab === "skills" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("skills", { list: parsedSkills });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Skills (Comma Separated)
                  </label>
                  <textarea
                    rows={4}
                    value={skillsContent.skillsInput}
                    onChange={(e) => setSkillsContent({ ...skillsContent, skillsInput: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="React, Next.js, Node.js, UI Design"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving Skills..." : "Save Skills Section"}
                </button>
              </form>
            )}

            {/* CONTACT TAB */}
            {activeTab === "contact" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("contact", contactContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactContent.email}
                    onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={contactContent.linkedin}
                    onChange={(e) => setContactContent({ ...contactContent, linkedin: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={contactContent.github}
                    onChange={(e) => setContactContent({ ...contactContent, github: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving Contact..." : "Save Contact Section"}
                </button>
              </form>
            )}

            {/* THEME TAB */}
            {activeTab === "theme" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveTheme();
                }}
                className="space-y-6"
              >
                {/* Colors */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">Accent Brand Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setThemeConfig({ ...themeConfig, primaryColor: preset.value })}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-xs transition text-left ${
                          themeConfig.primaryColor === preset.value
                            ? "border-indigo-500 bg-white/10 text-white"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: preset.value }}
                        />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <label className="block text-xs font-semibold text-slate-300">Typography</label>
                  <div className="space-y-2">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() =>
                          setThemeConfig({
                            ...themeConfig,
                            fontFamily: font.id as "sans" | "serif" | "mono",
                          })
                        }
                        className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                          themeConfig.fontFamily === font.id
                            ? "border-indigo-500 bg-white/10 text-white"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span className={font.cssClass}>{font.name}</span>
                        {themeConfig.fontFamily === font.id && (
                          <span className="text-indigo-400 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving Theme..." : "Save Theme Preferences"}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* Right Live Canvas Preview */}
        <main className="flex-1 overflow-y-auto bg-[#080b12] p-8 flex justify-center">
          <div
            className={`w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0d111a] p-8 shadow-2xl space-y-12 self-start ${previewFontClass}`}
          >
            {/* Live Hero */}
            <section className="relative space-y-4 border-b border-white/10 pb-8 text-center">
              <div className="inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-400">
                {website.category}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {heroContent.title}
              </h1>
              <p className="text-base text-slate-300 max-w-xl mx-auto">{heroContent.subtitle}</p>
              {heroContent.ctaText && (
                <button
                  className="rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow transition hover:opacity-90"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  {heroContent.ctaText} →
                </button>
              )}
            </section>

            {/* Live About */}
            {aboutContent.bio && (
              <section className="space-y-3 border-b border-white/10 pb-8">
                <h2 className="text-lg font-bold text-white">About</h2>
                <p className="text-slate-300 leading-relaxed text-xs whitespace-pre-line">
                  {aboutContent.bio}
                </p>
              </section>
            )}

            {/* Live Projects */}
            {projectsContent.items?.length > 0 && (
              <section className="space-y-4 border-b border-white/10 pb-8">
                <h2 className="text-lg font-bold text-white">{projectsContent.heading}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {projectsContent.items.map((project: any, i: number) => (
                    <a
                      key={i}
                      href={project.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-indigo-500"
                    >
                      <h3 className="font-semibold text-white text-xs">{project.title}</h3>
                      <p className="mt-1 text-xs text-slate-400">{project.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Live Skills */}
            {parsedSkills.length > 0 && (
              <section className="space-y-3 border-b border-white/10 pb-8">
                <h2 className="text-lg font-bold text-white">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Live Contact */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">Contact & Links</h2>
              <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-300">
                {contactContent.email && <span>📧 {contactContent.email}</span>}
                {contactContent.linkedin && <span>🔗 LinkedIn</span>}
                {contactContent.github && <span>💻 GitHub</span>}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}