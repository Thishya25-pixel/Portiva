import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient as createSupabaseDirect } from "@supabase/supabase-js";
import PortfolioView, {
  normalizeContent,
} from "@/components/portfolio/PortfolioView";
import PortfolioMediaFrame, {
  normalizeMedia,
} from "@/components/portfolio/PortfolioMediaFrame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadWebsite(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createSupabaseDirect(supabaseUrl, supabaseKey);

  // 1. Lookup published website by slug
  const { data: website, error } = await supabase
    .from("websites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[public-site] website lookup failed:", error.message);
  }

  if (!website) return null;

  // 2. Lookup author's profile directly (bypassing RLS so guest visitors read Pro status)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, pro_until, trial_ends_at")
    .eq("id", website.user_id)
    .maybeSingle();

  // 3. Lookup website content sections
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

  // 4. Media (avatar / hero background / gallery) lives in its own "media" section.
  const media = normalizeMedia(raw.media);
  const base = normalizeContent(raw, website.name);

  // An uploaded avatar takes priority over the pasted "Photo URL". Applying it here
  // means PortfolioView, OG tags and JSON-LD all pick it up.
  const content = {
    ...base,
    hero: {
      ...base.hero,
      avatarUrl: media.profile_image_url || base.hero.avatarUrl,
    },
  };

  return { website, profile, content, media };
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

  const { website, content, media } = result;
  const description =
    content.hero.subtitle ||
    content.about.bio.slice(0, 160) ||
    `${website.name} — ${website.category}. Portfolio built on Portiva.`;
  const url = `https://www.portiva.online/${website.slug}`;
  const ogImage = content.hero.avatarUrl || media.background_image_url;

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
      images: ogImage ? [ogImage] : undefined,
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

  const { website, profile, content, media } = result;

  // Validate active Pro status against Expiration Date / Active Trial
  const isPro = Boolean(
    profile?.is_pro &&
      ((profile.pro_until && new Date(profile.pro_until) > new Date()) ||
        (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
  );

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <PortfolioMediaFrame theme={website.theme_config} media={media}>
        <PortfolioView
          name={website.name}
          category={website.category}
          content={content}
          theme={website.theme_config}
          showBranding={!isPro}
          variant="live"
          className="min-h-screen scroll-smooth"
        />
      </PortfolioMediaFrame>
    </>
  );
}