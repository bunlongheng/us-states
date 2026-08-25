import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "US States";
const description =
  "Interactive US States game - study and quiz yourself on all 50 states, capitals, regions, and fun facts on a live map.";
const url = "https://us-states-bheng.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1120",
};

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  applicationName: title,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: url },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    title,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    type: "website",
    // og:image is injected automatically from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    // twitter:image is injected automatically from app/twitter-image.tsx
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
