import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share card for LinkedIn, Slack, and email previews. Colors mirror the tokens in globals.css.
export const alt = "Johan Alvarez — Senior Growth Marketer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/hero/johan-og.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const line = { fontSize: 76, fontWeight: 600, letterSpacing: -3 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #080e1c 55%, #10224a)",
          color: "#eef1f6",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          width={504}
          height={630}
          alt=""
          style={{ position: "absolute", right: 0, top: 0 }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 504,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(90deg, #0a1226 0%, rgba(8,14,28,0.6) 22%, rgba(8,14,28,0) 50%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
            height: "100%",
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
            Senior Growth Marketer
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={line}>The campaigns.</div>
            <div style={line}>The systems.</div>
            <div style={{ ...line, color: "#67e3f9" }}>The results.</div>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 28, color: "#9ea6b6" }}>
            <span style={{ color: "#eef1f6" }}>Johan Alvarez</span>
            <span>asjohan.com</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
