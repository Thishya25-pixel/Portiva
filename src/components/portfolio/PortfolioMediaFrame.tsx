import type { CSSProperties, ReactNode } from "react";
import { resolveTheme, type ThemeConfig } from "@/lib/portfolio-theme";

/* ------------------------------------------------------------------ */
/* Media model (stored in website_content, section = "media")          */
/* ------------------------------------------------------------------ */

export interface PortfolioMedia {
  profile_image_url: string;
  background_image_url: string;
  /** 0–90, percentage of black laid over the hero background. */
  background_overlay: number;
  gallery_images: string[];
}

export const DEFAULT_OVERLAY = 60;

const isHttpUrl = (v: unknown): v is string =>
  typeof v === "string" && /^https?:\/\//i.test(v.trim());

export function normalizeMedia(raw: unknown): PortfolioMedia {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const overlay =
    typeof r.background_overlay === "number" && Number.isFinite(r.background_overlay)
      ? Math.min(90, Math.max(0, Math.round(r.background_overlay)))
      : DEFAULT_OVERLAY;

  return {
    profile_image_url: isHttpUrl(r.profile_image_url) ? r.profile_image_url.trim() : "",
    background_image_url: isHttpUrl(r.background_image_url)
      ? r.background_image_url.trim()
      : "",
    background_overlay: overlay,
    gallery_images: Array.isArray(r.gallery_images)
      ? r.gallery_images.filter(isHttpUrl).map((u) => u.trim())
      : [],
  };
}

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

// Makes PortfolioView's own root see-through so the hero image shows behind it.
const SEE_THROUGH = "[&>*]:!bg-transparent [&>*]:![background-image:none]";

interface PortfolioMediaFrameProps {
  theme: ThemeConfig | null | undefined;
  media: PortfolioMedia;
  children: ReactNode;
}

export default function PortfolioMediaFrame({
  theme,
  media,
  children,
}: PortfolioMediaFrameProps) {
  const hasBackground = Boolean(media.background_image_url);

  if (!hasBackground) return <>{children}</>;

  const resolved = resolveTheme(theme ?? ({} as ThemeConfig));
  const bg = resolved.vars["--p-bg"];

  const frameStyle: CSSProperties = { backgroundColor: bg };

  return (
    <div className="relative isolate overflow-x-clip" style={frameStyle}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px] overflow-hidden sm:h-[720px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.background_image_url}
          alt=""
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${media.background_overlay / 100})` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${bg})` }}
        />
      </div>

      <div className={`relative z-10 ${SEE_THROUGH}`}>
        {children}
      </div>
    </div>
  );
}