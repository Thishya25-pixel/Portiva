import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PortfolioView, {
  normalizeContent,
} from "@/components/portfolio/PortfolioView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Sites change rarely; serve them from cache and refresh in the background. */
export const revalidate = 60;

async function loadWebsite(slug: string) {
  const supabase = await createClient();

  const { data: website, error } = await supabase
    .from("websites")
    .select("*, profiles:user_id(is_pro, pro_until, trial_ends_at)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[public-site] website lookup failed:", error.message);
  }

  if (!website) return null;

  const { data: contentRows, error: contentError } = await supabase
    .from("website_content")
    .select("section, content")
    .eq("website_id", website.id);

  if (contentError) {
    console.error("[public-site] content lookup failed:", contentError.message);
  }

  const raw: Record<string, any> = {};
  for (const row of contentRows ?? []) {
    raw[row.section] = row.content;
  }

  return { website, content: normalizeContent(raw, website.name) };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadWebsite(slug);

  if (!result) {
    return {
      title: "Site not found | Portiva",
      robots: { index: false, follow: false },
    };
  }

  const { website, content } = result;
  const description =
    content.hero.subtitle ||
    content.about.bio.slice(0, 160) ||
    `${website.name} — ${website.category}. Portfolio built on Portiva.`;
  const url = `https://www.portiva.online/${website.slug}`;

  return {
    title: `${website.name} — ${website.category}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: `${website.name} — ${website.category}`,
      description,
      url,
      siteName: website.name,
      images: content.hero.avatarUrl ? [content.hero.avatarUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${website.name} — ${website.category}`,
      description,
    },
  };
}

export default async function PublicWebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await loadWebsite(slug);

  if (!result) notFound();

  const { website, content } = result;

  // 1. Fetch user's profile with pro dates
  const profile = website.profiles as {
    is_pro?: boolean;
    pro_until?: string | null;
    trial_ends_at?: string | null;
  } | null;

  // 2. Validate Pro Status against Expiration Date
  const isPro = (() => {
    if (!profile?.is_pro) return false;

    const now = new Date();

    // Check if within 1-Month Pro Subscription
    if (profile.pro_until) {
      return new Date(profile.pro_until) > now;
    }

    // Check if within 24-Hour Instant Trial
    if (profile.trial_ends_at) {
      return new Date(profile.trial_ends_at) > now;
    }

    return true;
  })();

  const sameAs = [
    content.contact.linkedin,
    content.contact.github,
    content.contact.twitter,
    content.contact.website,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: website.name,
    jobTitle: website.category,
    description: content.hero.subtitle || undefined,
    url: `https://www.portiva.online/${website.slug}`,
    image: content.hero.avatarUrl || undefined,
    email: content.contact.email ? `mailto:${content.contact.email}` : undefined,
    knowsAbout: content.skills.list.length ? content.skills.list : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioView
        name={website.name}
        category={website.category}
        content={content}
        theme={website.theme_config}
        showBranding={!isPro}
        variant="live"
        className="min-h-screen scroll-smooth"
      />
    </>
  );
}