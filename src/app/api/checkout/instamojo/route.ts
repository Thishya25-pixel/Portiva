import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("=================================");
    console.log("INSTAMOJO CHECKOUT STARTED");
    console.log("=================================");

    const { plan } = await request.json();
    const amount = plan === "pro_yearly" ? "2999.00" : "299.00";

    if (!process.env.INSTAMOJO_API_KEY || !process.env.INSTAMOJO_AUTH_TOKEN) {
      return NextResponse.json(
        { error: "Instamojo credentials are missing." },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL is missing." },
        { status: 500 }
      );
    }

    // Using API v1.1 endpoint for Private Key & Auth Token headers
    const response = await fetch(
      "https://www.instamojo.com/api/1.1/payment-requests/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Api-Key": process.env.INSTAMOJO_API_KEY,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
        },
        body: new URLSearchParams({
          purpose: "Portiva Pro Subscription",
          amount: amount,
          buyer_name: "Portiva User",
          email: "user@portiva.online",
          phone: "9999999999",
          redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
          webhook: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/instamojo`,
          allow_repeated_payments: "False",
        }),
      }
    );

    console.log("INSTAMOJO STATUS:", response.status);

    const data = await response.json();
    console.log("INSTAMOJO RESPONSE:", data);

    // Account pending, invalid key header, or payment gateway not enabled
    if (
      response.status === 403 ||
      response.status === 401 ||
      !data.success ||
      data.message?.toLowerCase()?.includes("not enabled")
    ) {
      return NextResponse.json(
        {
          comingSoon: true,
          message:
            "Pro plan is coming soon! Payments are currently being activated.",
        },
        { status: 200 }
      );
    }

    // Successful payment link generation
    if (data.payment_request?.longurl) {
      return NextResponse.json({
        url: data.payment_request.longurl,
      });
    }

    return NextResponse.json(
      {
        error: "Unable to initiate payment",
        details: data,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("CHECKOUT SERVER ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}