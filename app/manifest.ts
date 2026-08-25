import type { MetadataRoute } from "next";

// Web app manifest so the game installs cleanly via "Add to Home Screen".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "US States",
    short_name: "US States",
    description:
      "Interactive US States game - study and quiz yourself on all 50 states, capitals, regions, and fun facts on a live map.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0b1120",
    theme_color: "#0b1120",
    categories: ["education", "games"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
