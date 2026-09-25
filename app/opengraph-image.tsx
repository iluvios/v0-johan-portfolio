import { ImageResponse } from "next/og";

// Share card for LinkedIn, Slack, and email previews. Colors mirror the tokens in globals.css.
export const alt = "Johan Alvarez — Senior Martech & GTM Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #080e1c 55%, #10224a)",
          color: "#eef1f6",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9ea6b6",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              background: "#67e3f9",
            }}
          />
          Senior Martech & GTM Engineer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -3 }}>
            The campaigns.
          </div>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -3 }}>
            The systems.
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 600,
              letterSpacing: -3,
              color: "#67e3f9",
            }}
          >
            The pipeline.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#9ea6b6",
          }}
        >
          <span style={{ color: "#eef1f6" }}>Johan Alvarez</span>
          <span>asjohan.com · Remote, US hours</span>
        </div>
      </div>
    ),
    size,
  );
}
