import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: website } = await supabase
    .from("websites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!website) {
    return {
      title: "Portfolio Not Found | Portiva",
    };
  }

  return {
    title: `${website.name} | ${website.category}`,
    description: `Official website of ${website.name}. Built on Portiva.`,
  };
}

export default async function PublicWebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch published website
  const { data: website, error } = await supabase
    .from("websites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching public website:", error.message);
  }

  if (!website) {
    notFound();
  }

  // 2. Fetch section content rows
  const { data: contentRows } = await supabase
    .from("website_content")
    .select("section, content")
    .eq("website_id", website.id);

  const content: Record<string, any> = {};
  if (contentRows) {
    for (const row of contentRows) {
      content[row.section] = row.content;
    }
  }

  const hero = content.hero || {
    title: website.name,
    subtitle: "Welcome to my official website.",
    ctaText: "Get in touch",
  };
  const about = content.about || { bio: "" };
  const projects = content.projects || { heading: "Featured Work", items: [] };
  const skillsList: string[] = content.skills?.list || [];
  const contact = content.contact || {};

  const primaryColor = website.theme_config?.primaryColor || "#6366f1";
  const fontFamily = website.theme_config?.fontFamily || "sans";

  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <div
      className={`min-h-screen bg-[#080b12] text-slate-100 ${fontClass} selection:bg-indigo-500 selection:text-white`}
    >
      <style>{`
        :root {
          --brand-primary: ${primaryColor};
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b12]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#" className="text-lg font-bold tracking-tight text-white hover:opacity-90">
            {website.name}
          </a>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
            {about.bio && (
              <a href="#about" className="transition hover:text-white">
                About
              </a>
            )}
            {projects.items?.length > 0 && (
              <a href="#projects" className="transition hover:text-white">
                Projects
              </a>
            )}
            {skillsList.length > 0 && (
              <a href="#skills" className="transition hover:text-white">
                Skills
              </a>
            )}
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-24 px-6 py-16">
        {/* Hero */}
        <section className="relative flex flex-col items-center text-center space-y-6 pt-8">
          <div
            className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: "var(--brand-primary)" }}
          />

          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {website.category}
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1]">
            {hero.title}
          </h1>

          {hero.subtitle && (
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
              {hero.subtitle}
            </p>
          )}

          {hero.ctaText && (
            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-xl transition hover:opacity-90"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {hero.ctaText} →
              </a>
            </div>
          )}
        </section>

        {/* About */}
        {about.bio && (
          <section id="about" className="scroll-mt-24 space-y-4 border-t border-white/10 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white">About</h2>
            <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line max-w-3xl">
              {about.bio}
            </p>
          </section>
        )}

        {/* Projects */}
        {projects.items?.length > 0 && (
          <section id="projects" className="scroll-mt-24 space-y-6 border-t border-white/10 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {projects.heading || "Featured Work"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.items.map((project: any, i: number) => (
                <a
                  key={i}
                  href={project.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-indigo-500/50 hover:bg-white/10"
                >
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skillsList.length > 0 && (
          <section id="skills" className="scroll-mt-24 space-y-4 border-t border-white/10 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="scroll-mt-24 space-y-6 border-t border-white/10 pt-16 pb-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Get in Touch</h2>
            <p className="text-sm text-slate-400">Feel free to connect or reach out directly.</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <span>📧</span> {contact.email}
              </a>
            )}
            {contact.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <span>🔗</span> LinkedIn Profile
              </a>
            )}
            {contact.github && (
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <span>💻</span> GitHub Profile
              </a>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080b12] py-8 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} {website.name} · Powered by{" "}
          <a
            href="https://www.portiva.online"
            className="font-semibold text-indigo-400 hover:underline"
          >
            Portiva
          </a>
        </p>
      </footer>
    </div>
  );
}