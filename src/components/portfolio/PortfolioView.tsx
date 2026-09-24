import * as React from "react";
import { resolveTheme, type ThemeConfig } from "@/lib/portfolio-theme";

/* ------------------------------------------------------------------ */
/* Content shape                                                       */
/* ------------------------------------------------------------------ */

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  availability: string;
  location: string;
  avatarUrl: string;
}

export interface AboutContent {
  heading: string;
  bio: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export interface ProjectsContent {
  heading: string;
  items: ProjectItem[];
}

export interface SkillsContent {
  heading: string;
  list: string[];
}

export interface ContactContent {
  heading: string;
  message: string;
  email: string;
  linkedin: string;
  whatsapp: string;    // <--- Added
  instagram: string;
  github: string;
  website: string;
  twitter: string;
  resume: string;
}

export interface MediaContent {
  gallery_images?: string[];
}

export interface PortfolioContent {
  hero: HeroContent;
  about: AboutContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  contact: ContactContent;
  media?: MediaContent;
}

/** Fills in every field so the renderer never has to guard for undefined. */
export function normalizeContent(
  raw: Record<string, any> | null | undefined,
  fallbackName: string,
): PortfolioContent {
  const c = raw ?? {};
  return {
    hero: {
      title: c.hero?.title || fallbackName,
      subtitle: c.hero?.subtitle ?? "",
      ctaText: c.hero?.ctaText ?? "",
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
      items: Array.isArray(c.projects?.items)
        ? c.projects.items.map((item: any) => ({
            title: item?.title ?? "",
            description: item?.description ?? "",
            url: item?.url ?? "",
            tags: Array.isArray(item?.tags) ? item.tags.filter(Boolean) : [],
          }))
        : [],
    },
    skills: {
      heading: c.skills?.heading || "What I work with",
      list: Array.isArray(c.skills?.list) ? c.skills.list.filter(Boolean) : [],
    },
    contact: {
      heading: c.contact?.heading || "Get in touch",
      message: c.contact?.message ?? "",
      email: c.contact?.email ?? "",
      linkedin: c.contact?.linkedin ?? "",
      whatsapp: c.contact?.whatsapp ?? "",   // <--- Added
      instagram: c.contact?.instagram ?? "",
      github: c.contact?.github ?? "",
      website: c.contact?.website ?? "",
      twitter: c.contact?.twitter ?? "",
      resume: c.contact?.resume ?? "",
    },
    media: {
      gallery_images: Array.isArray(c.media?.gallery_images)
        ? c.media.gallery_images.filter(Boolean)
        : [],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function Glyph({ path, label }: { path: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
    >
      {label ? <title>{label}</title> : null}
      <path d={path} />
    </svg>
  );
}

const GLYPHS = {
  whatsapp: "M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  linkedin: "M7 10v7M7 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 17v-7",
  github:
    "M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18",
  twitter: "M4 4l7.5 9.5L4.5 20M20 4l-7.6 8.6M20 20l-7-8.8",
  doc: "M7 3h7l4 4v14H7zM14 3v4h4M10 13h6M10 17h6",
  arrow: "M5 12h13m-5-5 5 5-5 5",
};

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export interface PortfolioViewProps {
  name: string;
  category: string;
  content: PortfolioContent;
  theme?: ThemeConfig | null;
  /** Free plans keep the Portiva credit in the footer. */
  showBranding?: boolean;
  /** "preview" disables navigation and the sticky header inside the editor. */
  variant?: "live" | "preview";
  className?: string;
}

export default function PortfolioView({
  name,
  category,
  content,
  theme,
  showBranding = true,
  variant = "live",
  className = "",
}: PortfolioViewProps) {
  const t = resolveTheme(theme);
  const isPreview = variant === "preview";
  const { hero, about, projects, skills, contact, media } = content;

  const links = [

    contact.whatsapp && {
    key: "whatsapp",
    label: "Book via WhatsApp",
    href: contact.whatsapp.startsWith("http")
      ? contact.whatsapp
      : `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`,
    glyph: GLYPHS.whatsapp,
  },
  contact.instagram && {
    key: "instagram",
    label: "Instagram",
    href: contact.instagram.startsWith("http")
      ? contact.instagram
      : `https://instagram.com/${contact.instagram.replace("@", "")}`,
    glyph: GLYPHS.instagram,
  },
    contact.email && {
      key: "email",
      label: contact.email,
      href: `mailto:${contact.email}`,
      glyph: GLYPHS.mail,
    },
    contact.linkedin && {
      key: "linkedin",
      label: "LinkedIn",
      href: contact.linkedin,
      glyph: GLYPHS.linkedin,
    },
    contact.github && {
      key: "github",
      label: "GitHub",
      href: contact.github,
      glyph: GLYPHS.github,
    },
    contact.twitter && {
      key: "twitter",
      label: "X",
      href: contact.twitter,
      glyph: GLYPHS.twitter,
    },
    contact.website && {
      key: "website",
      label: "Website",
      href: contact.website,
      glyph: GLYPHS.globe,
    },
    contact.resume && {
      key: "resume",
      label: "Résumé",
      href: contact.resume,
      glyph: GLYPHS.doc,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    href: string;
    glyph: string;
  }[];

  const galleryImages = media?.gallery_images || [];

  const nav = [
    about.bio && { id: "about", label: about.heading },
    projects.items.length > 0 && { id: "projects", label: projects.heading },
    skills.list.length > 0 && { id: "skills", label: skills.heading },
    galleryImages.length > 0 && { id: "gallery", label: "Gallery" },
    links.length > 0 && { id: "contact", label: contact.heading },
  ].filter(Boolean) as { id: string; label: string }[];

  const linkProps = (href: string) =>
    isPreview
      ? { onClick: (e: React.MouseEvent) => e.preventDefault(), href }
      : { href, target: "_blank" as const, rel: "noreferrer noopener" };

  return (
    <div
      className={`relative isolate min-h-full bg-[var(--p-bg)] text-[var(--p-text)] [font-family:var(--p-font-body)] ${className}`}
      style={t.vars as React.CSSProperties}
    >
      {t.backdrop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
          style={{ background: t.backdrop }}
        />
      )}

      {/* Header */}
      <header
        className={`${
          isPreview ? "relative" : "sticky top-0"
        } z-30 border-b border-[var(--p-border)] bg-[var(--p-bg)]/85 backdrop-blur`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <span className="truncate text-sm font-semibold tracking-tight [font-family:var(--p-font-heading)]">
            {name}
          </span>

          {nav.length > 0 && (
            <nav className="hidden items-center gap-5 text-xs sm:flex">
              {nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  className="whitespace-nowrap text-[var(--p-muted)] transition-colors hover:text-[var(--p-text)] focus-visible:text-[var(--p-text)]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-6">
        {/* Hero */}
        <section className="py-14 sm:py-20">
          {hero.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.avatarUrl}
              alt={name}
              className="mb-7 h-20 w-20 rounded-full object-cover ring-1"
              style={{ boxShadow: "var(--p-shadow)", borderColor: "var(--p-border)" }}
            />
          )}

          {(hero.availability || category) && (
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
              {hero.availability && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-[var(--p-radius-sm)] px-2.5 py-1 font-medium"
                  style={{
                    background: "var(--p-accent-soft)",
                    color: "var(--p-accent-text)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--p-accent)" }}
                  />
                  {hero.availability}
                </span>
              )}
              {category && (
                <span className="text-[var(--p-muted)]">{category}</span>
              )}
              {hero.location && (
                <span className="text-[var(--p-muted)]">· {hero.location}</span>
              )}
            </div>
          )}

          <h1 className="max-w-[18ch] text-4xl font-semibold leading-[1.05] tracking-tight [font-family:var(--p-font-heading)] sm:text-6xl">
            {hero.title}
          </h1>

          {hero.subtitle && (
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-[var(--p-muted)] sm:text-lg">
              {hero.subtitle}
            </p>
          )}

          {hero.ctaText && links.length > 0 && (
            <a
              href={isPreview ? "#" : "#contact"}
              onClick={isPreview ? (e) => e.preventDefault() : undefined}
              className="mt-8 inline-flex items-center gap-2 rounded-[var(--p-radius-md)] px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: "var(--p-accent)",
                color: "var(--p-accent-contrast)",
              }}
            >
              {hero.ctaText}
              <Glyph path={GLYPHS.arrow} />
            </a>
          )}
        </section>

        {/* About */}
        {about.bio && (
          <Section id="about" heading={about.heading}>
            <p className="max-w-[68ch] whitespace-pre-line text-[15px] leading-7 text-[var(--p-muted)]">
              {about.bio}
            </p>
          </Section>
        )}

        {/* Projects */}
        {projects.items.length > 0 && (
          <Section id="projects" heading={projects.heading}>
            <ul className="space-y-3">
              {projects.items.map((project, i) => {
                const Wrapper = project.url ? "a" : "div";
                return (
                  <li key={i}>
                    <Wrapper
                      {...(project.url ? linkProps(project.url) : {})}
                      className="block rounded-[var(--p-radius-lg)] border border-[var(--p-border)] bg-[var(--p-surface)] p-5 transition-colors hover:border-[var(--p-accent-line)]"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-base font-semibold [font-family:var(--p-font-heading)]">
                          {project.title || "Untitled project"}
                        </h3>
                        {project.url && (
                          <span
                            className="shrink-0 text-xs"
                            style={{ color: "var(--p-accent-text)" }}
                          >
                            Visit
                          </span>
                        )}
                      </div>

                      {project.description && (
                        <p className="mt-2 max-w-[62ch] text-sm leading-6 text-[var(--p-muted)]">
                          {project.description}
                        </p>
                      )}

                      {project.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.tags.map((tag, j) => (
                            <span
                              key={j}
                              className="rounded-[var(--p-radius-sm)] px-2 py-0.5 text-[11px] text-[var(--p-muted)]"
                              style={{ background: "var(--p-surface-strong)" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Wrapper>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* Skills */}
        {skills.list.length > 0 && (
          <Section id="skills" heading={skills.heading}>
            <div className="flex flex-wrap gap-2">
              {skills.list.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-[var(--p-radius-sm)] border px-3 py-1.5 text-[13px]"
                  style={{
                    borderColor: "var(--p-border)",
                    background: "var(--p-surface)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Gallery Showcase Section */}
        {galleryImages.length > 0 && (
          <Section id="gallery" heading="Gallery">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-color:rgba(99,102,241,0.3)_transparent] [scrollbar-width:thin]">
              {galleryImages.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="group h-48 w-72 shrink-0 snap-center overflow-hidden rounded-[var(--p-radius-lg)] border border-[var(--p-border)] bg-[var(--p-surface)] sm:w-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery item ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Contact */}
        {links.length > 0 && (
          <Section id="contact" heading={contact.heading}>
            {contact.message && (
              <p className="mb-5 max-w-[60ch] text-[15px] leading-7 text-[var(--p-muted)]">
                {contact.message}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {links.map((link) => (
                <a
                  key={link.key}
                  {...linkProps(link.href)}
                  className="inline-flex items-center gap-2 rounded-[var(--p-radius-md)] border px-3.5 py-2.5 text-sm transition-colors"
                  style={{
                    borderColor: "var(--p-border)",
                    background: "var(--p-surface)",
                  }}
                >
                  <span style={{ color: "var(--p-accent-text)" }}>
                    <Glyph path={link.glyph} />
                  </span>
                  <span className="break-all">{link.label}</span>
                </a>
              ))}
            </div>
          </Section>
        )}
      </main>

      {/* Footer is rendered AT THE BOTTOM */}
      <footer
        className="mt-6 border-t border-[var(--p-border)] px-5 py-8 text-center text-xs text-[var(--p-muted)] sm:px-6"
        style={{ borderColor: "var(--p-border)" }}
      >
        <p>
          © {new Date().getFullYear()} {name}
          {showBranding && (
            <>
              {" · Made with "}
              <a
                href="https://www.portiva.online"
                onClick={isPreview ? (e) => e.preventDefault() : undefined}
                className="font-medium underline-offset-4 hover:underline"
                style={{ color: "var(--p-accent-text)" }}
              >
                Portiva
              </a>
            </>
          )}
        </p>
      </footer>
    </div>
  );
}

function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-portfolio-section
      className="scroll-mt-20 border-t border-[var(--p-border)] py-12 sm:py-14"
      style={{ borderColor: "var(--p-border)" }}
    >
      <h2 className="mb-5 text-lg font-semibold tracking-tight [font-family:var(--p-font-heading)]">
        {heading}
      </h2>
      {children}
    </section>
  );
}