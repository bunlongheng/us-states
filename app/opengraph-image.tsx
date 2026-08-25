import { ImageResponse } from "next/og";

// Branded 1200x630 social share card, generated at build time (statically optimized).
export const alt =
  "US States - an interactive geography game to learn all 50 states on a live, color-coded map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The 8 region colors used by the in-app legend.
const regionColors = [
  "#2563eb",
  "#06b6d4",
  "#16a085",
  "#65a30d",
  "#d97706",
  "#ea580c",
  "#dc2626",
  "#7c3aed",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0b1120 0%, #111a2e 55%, #0b1120 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "36px" }}>
          {regionColors.map((c) => (
            <div
              key={c}
              style={{
                width: "64px",
                height: "12px",
                borderRadius: "6px",
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: "132px",
            fontWeight: 800,
            letterSpacing: "-4px",
            lineHeight: 1,
          }}
        >
          US States
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "40px",
            color: "#94a3b8",
            maxWidth: "900px",
            lineHeight: 1.25,
          }}
        >
          Learn all 50 states, capitals, and regions on a live, color-coded map -
          then quiz yourself across 5 difficulty tiers.
        </div>
        <div
          style={{
            marginTop: "52px",
            display: "flex",
            alignItems: "center",
            fontSize: "30px",
            color: "#64748b",
          }}
        >
          us-states-bheng.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
