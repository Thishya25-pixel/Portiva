import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  const MAIN_DOMAIN = "portiva.online";

  // Skip system routes, static assets, login, and dashboard pages
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/editor") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Retrieve environment variables safely
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Custom Subdomain Routing (e.g. mytrail.portiva.online)
  if (
    hostname.endsWith(`.${MAIN_DOMAIN}`) &&
    !hostname.startsWith("www.") &&
    hostname !== MAIN_DOMAIN
  ) {
    const subdomain = hostname.replace(`.${MAIN_DOMAIN}`, "");

    // Fetch site matching custom_subdomain
    const { data: site } = await supabase
      .from("websites")
      .select("slug, user_id")
      .eq("custom_subdomain", subdomain)
      .eq("published", true)
      .maybeSingle();

    if (site) {
      // Direct lookup of author profile for Pro validation
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, pro_until, trial_ends_at")
        .eq("id", site.user_id)
        .maybeSingle();

      const isPro = Boolean(
        profile?.is_pro &&
          ((profile.pro_until && new Date(profile.pro_until) > new Date()) ||
            (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
      );

      if (isPro) {
        return NextResponse.rewrite(new URL(`/${site.slug}${url.pathname}`, req.url));
      }
    }
  }

  // 2. Custom Domain Routing (e.g. rahul.com)
  if (!hostname.includes(MAIN_DOMAIN) && !hostname.includes("localhost")) {
    const cleanDomain = hostname.replace("www.", "");

    const { data: site } = await supabase
      .from("websites")
      .select("slug, user_id")
      .eq("custom_domain", cleanDomain)
      .eq("published", true)
      .maybeSingle();

    if (site) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, pro_until, trial_ends_at")
        .eq("id", site.user_id)
        .maybeSingle();

      const isPro = Boolean(
        profile?.is_pro &&
          ((profile.pro_until && new Date(profile.pro_until) > new Date()) ||
            (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
      );

      if (isPro) {
        return NextResponse.rewrite(new URL(`/${site.slug}${url.pathname}`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};