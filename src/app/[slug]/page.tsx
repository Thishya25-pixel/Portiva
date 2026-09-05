import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: website, error } = await supabase
  .from("websites")
  .select("*")
  .eq("slug", slug)
  .eq("published", true)
  .maybeSingle();

if (error) {
  // Log message and details explicitly instead of logging the raw error object
  console.error("Supabase Query Error:", error.message, error.details);
}

  if (!website) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${website.name} | ${website.category}`,
    description: `Official website of ${website.name}.`,
  };
}

export default async function PublicWebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch published website by slug
  const { data: website } = await supabase
    .from("websites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  // If site doesn't exist or isn't published, return 404
  if (!website) {
  return (
    <div className="p-10 text-white bg-slate-950 font-mono">
      <h1>Debug Info</h1>
      <p>Target Slug: <strong>{slug}</strong></p>
      <p>Website returned from Supabase: <strong>null</strong></p>
      <p>Check RLS policies or published status in your Supabase table.</p>
    </div>
  );
}

  // 2. Fetch section contents for this website
  const { data: contentRows } = await supabase
    .from("website_content")
    .select("section, content")
    .eq("website_id", website.id);

  // Reconstruct sections into key-value map
  const content: Record<string, any> = {};
  if (contentRows) {
    for (const row of contentRows) {
      content[row.section] = row.content;
    }
  }

  const hero = content.hero || {
    title: website.name,
    subtitle: "Welcome to my website.",
    ctaText: "Get in touch",
  };
  const about = content.about || { bio: "" };
  const skillsList: string[] = content.skills?.list || [];
  const contact = content.contact || {};

  const primaryColor = website.theme_config?.primaryColor || "#2563eb"; // Fallback to blue-600

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Dynamic Theme Color Injected via CSS Variables */}
      <style>{`
        :root {
          --brand-primary: ${primaryColor};
        }
      `}</style>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#" className="text-lg font-bold tracking-tight text-white hover:opacity-90">
            {website.name}
          </a>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#about" className="transition hover:text-white">
              About
            </a>
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
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-6 pt-8">
          <div className="inline-block rounded-full bg-slate-800/80 px-3.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700">
            {website.category}
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              {hero.subtitle}
            </p>
          )}
          {hero.ctaText && (
            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {hero.ctaText}
              </a>
            </div>
          )}
        </section>

        {/* About Section */}
        {about.bio && (
          <section id="about" className="scroll-mt-24 space-y-4 border-t border-slate-800/80 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white">About</h2>
            <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line max-w-3xl">
              {about.bio}
            </p>
          </section>
        )}

        {/* Skills Section */}
        {skillsList.length > 0 && (
          <section id="skills" className="scroll-mt-24 space-y-4 border-t border-slate-800/80 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-24 space-y-6 border-t border-slate-800/80 pt-16 pb-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Get in Touch</h2>
            <p className="text-sm text-slate-400">Feel free to connect or reach out directly.</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <span>📧</span> {contact.email}
              </a>
            )}
            {contact.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <span>🔗</span> LinkedIn Profile
              </a>
            )}
            {contact.github && (
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <span>💻</span> GitHub Profile
              </a>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {website.name}. Powered by SaaS Builder.</p>
      </footer>
    </div>
  );
}