import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  const MAIN_DOMAIN = "portiva.online";

  // Ignore static assets, internal routes, dashboard, and admin paths
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/editor") ||
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

  // 1. Subdomain Routing (e.g. rahul.portiva.online)
  if (hostname.endsWith(`.${MAIN_DOMAIN}`) && !hostname.startsWith("www.")) {
    const subdomain = hostname.replace(`.${MAIN_DOMAIN}`, "");

    const { data: site } = await supabase
      .from("websites")
      .select("slug, profiles:user_id(is_pro, pro_until, trial_ends_at)")
      .eq("custom_subdomain", subdomain)
      .maybeSingle();

    const profile = (site as any)?.profiles;
    const isPro = Boolean(
      profile?.is_pro &&
        ((profile.pro_until && new Date(profile.pro_until) > new Date()) ||
          (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
    );

    if (site && isPro) {
      return NextResponse.rewrite(new URL(`/${site.slug}${url.pathname}`, req.url));
    }
  }

  // 2. Custom Domain Routing (e.g. rahul.com)
  if (!hostname.includes(MAIN_DOMAIN) && !hostname.includes("localhost")) {
    const cleanDomain = hostname.replace("www.", "");

    const { data: site } = await supabase
      .from("websites")
      .select("slug, profiles:user_id(is_pro, pro_until, trial_ends_at)")
      .eq("custom_domain", cleanDomain)
      .maybeSingle();

    const profile = (site as any)?.profiles;
    const isPro = Boolean(
      profile?.is_pro &&
        ((profile.pro_until && new Date(profile.pro_until) > new Date()) ||
          (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
    );

    if (site && isPro) {
      return NextResponse.rewrite(new URL(`/${site.slug}${url.pathname}`, req.url));
    }
  }

  return NextResponse.next();
}

// Add default export for edge runtime bundler compatibility
export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};