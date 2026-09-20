// src/app/api/payments/submit-utr/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, utrNumber } = await req.json();

    if (!userId || !utrNumber || utrNumber.trim().length < 8) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const trimmedUtr = utrNumber.trim();

    // 1. Insert the payment request record
    const { error: insertError } = await supabaseAdmin
      .from("payment_requests")
      .insert({
        user_id: userId,
        amount: 199,
        utr_number: trimmedUtr,
        status: "pending",
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This UTR number has already been submitted." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // 2. Grant 24-Hour Instant Pro Access
    const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        is_pro: true,
        trial_ends_at: trialEndsAt,
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Pro activated instantly for 24 hours while payment verifies!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}