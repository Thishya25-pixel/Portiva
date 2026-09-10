// src/app/layout.tsx
import type { Metadata } from "next";

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

  // Open Graph / Facebook / LinkedIn Card Metadata
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
        url: "/og", // Recommended: 1200x630px image in your /public folder
        width: 1200,
        height: 630,
        alt: "Portiva Platform Preview",
      },
    ],
  },

  // Twitter / X Card Metadata
  twitter: {
    card: "summary_large_image",
    title: "Portiva — Build & Launch Custom Portfolios in Minutes",
    description:
      "Turn your work into a client-winning online presence. Build and publish your custom platform in minutes.",
    images: ["/og-image.png"],
  },

  // Browser Icons & PWA Metadata
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};