import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Instamojo sends form-encoded payment data
    const status = formData.get("status") as string;
    const buyerEmail = formData.get("buyer") as string;
    const paymentId = formData.get("payment_id") as string;

    if (status === "Credit" && buyerEmail) {
      // Create admin client with Service Role key to bypass RLS policies
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ 
          is_pro: true, 
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq("email", buyerEmail);

      if (error) {
        console.error("Failed to update profile to Pro:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Instamojo Webhook Processing Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}