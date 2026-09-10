// src/app/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090d16",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)",
          backgroundSize: "50px 50px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "30px",
              fontWeight: "bold",
              marginRight: "16px",
            }}
          >
            P
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            Portiva
          </span>
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            background: "linear-gradient(to right, #ffffff, #94a3b8)",
            backgroundClip: "text",
            color: "transparent",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          Build & Launch Custom Portfolios in Minutes
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#64748b",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Transform your work into client-winning sites. Fast, responsive, and crafted for modern creators.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}