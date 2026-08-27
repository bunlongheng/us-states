import type { MetadataRoute } from "next";

const url = "https://us-states-bheng.vercel.app";

// Allow all crawlers; point them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
