// src/app/api/checkout/instamojo/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Authenticate Supabase user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { plan } = await request.json();
    const amount = plan === "pro_yearly" ? "2999" : "299";
    const planName = plan === "pro_yearly" ? "Pro Yearly" : "Pro Monthly";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portiva.online";

    const clientId = process.env.INSTAMOJO_CLIENT_ID;
    const clientSecret = process.env.INSTAMOJO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Instamojo Client ID or Client Secret in .env.local");
      return NextResponse.json(
        { error: "Payment gateway credentials missing" },
        { status: 500 }
      );
    }

    // 2. Fetch OAuth2 Token (Instamojo v2 API)
    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "client_credentials");
    tokenParams.append("client_id", clientId);
    tokenParams.append("client_secret", clientSecret);

    const tokenResponse = await fetch("https://api.instamojo.com/oauth2/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Instamojo Auth Token Error:", tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error || "Authentication with Instamojo failed" },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // 3. Create Payment Request using v2 Endpoint & Bearer Token
    const paymentParams = new URLSearchParams();
    paymentParams.append("purpose", `Portiva ${planName} Plan`);
    paymentParams.append("amount", amount);
    paymentParams.append(
      "buyer_name",
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Portiva Creator"
    );
    paymentParams.append("email", user.email || "");
    paymentParams.append("send_email", "True");
    paymentParams.append("redirect_url", `${siteUrl}/dashboard?payment=success`);
    paymentParams.append("webhook", `${siteUrl}/api/webhooks/instamojo`);

    const paymentResponse = await fetch("https://api.instamojo.com/v2/payment_requests/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: paymentParams,
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok || paymentData.error) {
      console.error("Instamojo Payment Request Error:", paymentData);
      return NextResponse.json(
        { error: paymentData.message || paymentData.error || "Failed to generate checkout link" },
        { status: paymentResponse.status }
      );
    }

    // Return the checkout link (v2 returns `longurl` inside payment_request object)
    const longurl = paymentData.longurl || paymentData.payment_request?.longurl;

    if (!longurl) {
      console.error("No longurl returned in response:", paymentData);
      return NextResponse.json(
        { error: "Payment gateway did not return a valid URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: longurl });
  } catch (err: any) {
    console.error("Instamojo Checkout Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}