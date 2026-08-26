import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegister from "./sw-register";

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
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    type: "website",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "US States app icon" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/icon.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
