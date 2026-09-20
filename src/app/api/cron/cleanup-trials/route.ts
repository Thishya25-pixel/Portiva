// src/app/api/cron/cleanup-trials/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date().toISOString();

    // 1. Fetch expired profiles that have not been permanently approved
    const { data: expiredProfiles, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .lt("trial_ends_at", now);

    if (fetchError) throw fetchError;

    if (!expiredProfiles || expiredProfiles.length === 0) {
      return NextResponse.json({ message: "No expired trials found." });
    }

    const expiredUserIds = expiredProfiles.map((p) => p.id);

    // 2. Check payment_requests status for each user
    for (const userId of expiredUserIds) {
      const { data: approvedPayment } = await supabaseAdmin
        .from("payment_requests")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "approved")
        .maybeSingle();

      if (!approvedPayment) {
        // Demote back to free
        await supabaseAdmin
          .from("profiles")
          .update({ is_pro: false, trial_ends_at: null })
          .eq("id", userId);
      } else {
        // Permanent Pro user — clear trial timer
        await supabaseAdmin
          .from("profiles")
          .update({ trial_ends_at: null })
          .eq("id", userId);
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiredUserIds.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}