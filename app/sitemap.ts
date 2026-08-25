import type { MetadataRoute } from "next";

const url = "https://us-states-bheng.vercel.app";

// Single-page app - one canonical entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
