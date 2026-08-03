import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1120",
};

export const metadata: Metadata = {
  title: "US States",
  description: "Interactive US States game - study and quiz yourself on all 50 states, capitals, regions, and fun facts on a live map.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
