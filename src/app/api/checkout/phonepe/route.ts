// src/app/api/checkout/phonepe/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();
    const amount = plan === "pro_yearly" ? 299900 : 29900; // Amount in paise (₹299 = 29900)
    const transactionId = `MT${Date.now()}`;

    const merchantId = process.env.PHONEPE_MERCHANT_ID!;
    const saltKey = process.env.PHONEPE_SALT_KEY!;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

    const payload = {
      merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: "USER_" + Date.now(),
      amount,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/phonepe`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = `${sha256}###${saltIndex}`;

    const response = await fetch("https://api.phonepe.com/apis/hermes/pg/v1/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({ url: data.data.instrumentResponse.redirectInfo.url });
    }

    return NextResponse.json({ error: data.message || "Checkout creation failed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}