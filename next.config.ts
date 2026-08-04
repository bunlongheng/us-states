import type { NextConfig } from "next";

// Next dev (Turbopack/HMR) evaluates code via eval(); production never does.
// iOS Safari strictly enforces CSP, so the dev bundle needs 'unsafe-eval' to run
// on a phone. Production keeps script-src locked to 'self'.
const isDev = process.env.NODE_ENV !== "production";

// The app is fully self-contained: the US topojson is served from /public, so
// connect-src stays 'self'. 'unsafe-inline' in script-src is required for Next's
// framework bootstrap scripts on a statically prerendered page (a nonce would force
// dynamic rendering); the app itself has no user input and no dangerouslySetInnerHTML,
// so there is no first-party injection surface. object-src is locked to 'none'.
const csp = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
