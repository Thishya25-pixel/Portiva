// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // Adjust path to your CSS if needed

// 1. Named export for metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://www.portiva.online"),
  title: {
    default: "Portiva — Build & Launch Custom Portfolios in Minutes",
    template: "%s | Portiva",
  },
  description:
    "Transform your work into high-converting personal portfolios and showcase sites. Fast, responsive, and crafted for modern creators and professionals.",
  keywords: [
    "portfolio builder",
    "personal website",
    "showcase platform",
    "developer portfolio",
    "creator sites",
    "Portiva",
  ],
  authors: [{ name: "Portiva Team" }],
  creator: "Portiva",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.portiva.online",
    title: "Portiva — Stand Out with Professional Portfolios",
    description:
      "Turn your work into a client-winning online presence. Build and publish your custom platform in minutes.",
    siteName: "Portiva",
    images: [
      {
        url: "/og", // Points to your dynamic image route at src/app/og/route.tsx
        width: 1200,
        height: 630,
        alt: "Portiva Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portiva — Build & Launch Custom Portfolios in Minutes",
    description:
      "Turn your work into a client-winning online presence. Build and publish your custom platform in minutes.",
    images: ["/og"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

// 2. REQUIRED: Default export for the layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090d16] text-white">
        {children}
      </body>
    </html>
  );
}