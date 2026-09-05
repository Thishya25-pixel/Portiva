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
  { name: "Electric Blue", value: "#2563eb" },
  { name: "Emerald Green", value: "#059669" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose Crimson", value: "#e11d48" },
  { name: "Amber Gold", value: "#d97706" },
  { name: "Slate Minimal", value: "#475569" },
];

const FONT_OPTIONS = [
  { id: "sans", name: "Modern Sans-Serif", cssClass: "font-sans" },
  { id: "serif", name: "Classic Serif", cssClass: "font-serif" },
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

  const [activeTab, setActiveTab] = useState<"hero" | "about" | "skills" | "contact" | "theme">("hero");
  const [isPublished, setIsPublished] = useState(website.published);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Section Content States
  const [heroContent, setHeroContent] = useState({
    title: initialContent.hero?.title || website.name || "",
    subtitle: initialContent.hero?.subtitle || "Welcome to my official website.",
    ctaText: initialContent.hero?.ctaText || "Get In Touch",
  });

  const [aboutContent, setAboutContent] = useState({
    bio: initialContent.about?.bio || "Passionate professional building modern software solutions.",
  });

  const [skillsContent, setSkillsContent] = useState({
    skillsInput: initialContent.skills?.list?.join(", ") || "React, Next.js, TypeScript, Tailwind CSS, Supabase",
  });

  const [contactContent, setContactContent] = useState({
    email: initialContent.contact?.email || "",
    linkedin: initialContent.contact?.linkedin || "",
    github: initialContent.contact?.github || "",
  });

  // Theme State
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: website.theme_config?.primaryColor || "#2563eb",
    fontFamily: (website.theme_config?.fontFamily || "sans") as "sans" | "serif" | "mono",
  });

  // Save specific section content to Supabase
  async function handleSaveSection(sectionName: string, contentData: object) {
    setSaving(true);
    setStatusMessage(null);

    const { error } = await supabase
      .from("website_content")
      .upsert(
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
      setStatusMessage({ type: "error", text: `Failed to save ${sectionName}: ${error.message}` });
    } else {
      setStatusMessage({ type: "success", text: `${sectionName.toUpperCase()} section saved!` });
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    }
  }

  // Save Theme Config to 'websites' table
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
      setStatusMessage({ type: "error", text: `Failed to save theme: ${error.message}` });
    } else {
      setStatusMessage({ type: "success", text: "Theme preferences updated!" });
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    }
  }

  // Toggle Publish / Unpublish
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
    .map((s:string) => s.trim())
    .filter(Boolean);

  const previewFontClass =
    themeConfig.fontFamily === "serif"
      ? "font-serif"
      : themeConfig.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <div className="flex h-screen w-full flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
          >
            ← Dashboard
          </Link>
          <div>
            <h1 className="text-base font-bold text-white">{website.name}</h1>
            <p className="text-xs text-slate-400 font-mono">/{website.slug}</p>
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
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
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
              className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              View Live ↗
            </a>
          )}
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Form Controls */}
        <aside className="w-full max-w-md border-r border-slate-800 bg-slate-900 flex flex-col">
          {/* Section Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950 px-2 pt-2 gap-1 overflow-x-auto">
            {(["hero", "about", "skills", "contact", "theme"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-t-md py-2 px-3 text-xs font-semibold capitalize transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-slate-900 text-blue-400 border-t-2 border-blue-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                {tab === "theme" ? "🎨 Theme" : tab}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "hero" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("hero", heroContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Main Heading</label>
                  <input
                    type="text"
                    value={heroContent.title}
                    onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle / Tagline</label>
                  <textarea
                    rows={3}
                    value={heroContent.subtitle}
                    onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={heroContent.ctaText}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving Hero..." : "Save Hero Section"}
                </button>
              </form>
            )}

            {activeTab === "about" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("about", aboutContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Overview</label>
                  <textarea
                    rows={6}
                    value={aboutContent.bio}
                    onChange={(e) => setAboutContent({ ...aboutContent, bio: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Tell visitors about your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving About..." : "Save About Section"}
                </button>
              </form>
            )}

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
                    Skills / Tech Stack (Comma Separated)
                  </label>
                  <textarea
                    rows={4}
                    value={skillsContent.skillsInput}
                    onChange={(e) => setSkillsContent({ ...skillsContent, skillsInput: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Python, React, Tailwind CSS, Supabase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving Skills..." : "Save Skills Section"}
                </button>
              </form>
            )}

            {activeTab === "contact" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("contact", contactContent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactContent.email}
                    onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={contactContent.linkedin}
                    onChange={(e) => setContactContent({ ...contactContent, linkedin: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={contactContent.github}
                    onChange={(e) => setContactContent({ ...contactContent, github: e.target.value })}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://github.com/username"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving Contact..." : "Save Contact Section"}
                </button>
              </form>
            )}

            {/* THEME CUSTOMIZATION TAB */}
            {activeTab === "theme" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveTheme();
                }}
                className="space-y-6"
              >
                {/* Brand Accent Color */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">Brand Primary Color</label>
                  
                  {/* Color Presets Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setThemeConfig({ ...themeConfig, primaryColor: preset.value })}
                        className={`flex items-center gap-2 rounded-md border p-2 text-xs transition text-left ${
                          themeConfig.primaryColor === preset.value
                            ? "border-blue-500 bg-slate-800 text-white"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
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

                  {/* Custom Color Input Picker */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="color"
                      value={themeConfig.primaryColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1"
                    />
                    <input
                      type="text"
                      value={themeConfig.primaryColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                      placeholder="#2563eb"
                      className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Typography Selection */}
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <label className="block text-xs font-semibold text-slate-300">Typography Style</label>
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
                        className={`w-full flex items-center justify-between rounded-md border p-3 text-xs transition ${
                          themeConfig.fontFamily === font.id
                            ? "border-blue-500 bg-slate-800 text-white"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span className={font.cssClass}>{font.name}</span>
                        {themeConfig.fontFamily === font.id && (
                          <span className="text-blue-400 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving Theme..." : "Save Theme Preferences"}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* Right Side: Live Canvas Preview */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8 flex justify-center">
          <div
            className={`w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-12 self-start ${previewFontClass}`}
          >
            {/* Live Hero Preview */}
            <section className="space-y-4 border-b border-slate-800 pb-8 text-center">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">{heroContent.title}</h1>
              <p className="text-lg text-slate-300 max-w-xl mx-auto">{heroContent.subtitle}</p>
              {heroContent.ctaText && (
                <button
                  className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  {heroContent.ctaText}
                </button>
              )}
            </section>

            {/* Live About Preview */}
            <section className="space-y-3 border-b border-slate-800 pb-8">
              <h2 className="text-xl font-bold text-white">About</h2>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {aboutContent.bio}
              </p>
            </section>

            {/* Live Skills Preview */}
            <section className="space-y-3 border-b border-slate-800 pb-8">
              <h2 className="text-xl font-bold text-white">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {parsedSkills.map((skill:string, index:number) => (
                  <span
                    key={index}
                    className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Live Contact Preview */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">Contact</h2>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300">
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