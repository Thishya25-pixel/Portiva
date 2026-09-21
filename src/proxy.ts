import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  const MAIN_DOMAIN = "portiva.online";

  // 1. Skip system, static assets, and primary app routes
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

  // 2. Handle Wildcard Subdomains (e.g. mytrail.portiva.online)
  if (
    hostname.endsWith(`.${MAIN_DOMAIN}`) &&
    !hostname.startsWith("www.") &&
    hostname !== MAIN_DOMAIN
  ) {
    const subdomain = hostname.replace(`.${MAIN_DOMAIN}`, "");

    // Fetch site matching custom_subdomain
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

    // If site exists and user is Pro, rewrite to public portfolio route
    if (site && isPro) {
      const rewriteUrl = new URL(`/${site.slug}${url.pathname}`, req.url);
      // Strip authentication headers so auth middleware doesn't trigger a login redirect
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};