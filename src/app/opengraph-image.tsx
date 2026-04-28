import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sentinel — pre-shift risk for the Phoebe scheduling agent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#FAF7F1",
          backgroundImage:
            "radial-gradient(circle at 78% 28%, rgba(31,77,95,0.14) 0%, rgba(31,77,95,0) 55%)",
          color: "#1B1815",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#1F4D5F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#FAF7F1",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6B6356",
            }}
          >
            Sentinel
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              fontWeight: 500,
              maxWidth: 980,
            }}
          >
            12 hours ahead of the callout.
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.3,
              color: "#6B6356",
              maxWidth: 880,
            }}
          >
            Pre-warmed backups for the Phoebe Scheduler. Same agents. Warmer
            pool. Higher fill rate.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 18,
            color: "#A39787",
            letterSpacing: "0.02em",
          }}
        >
          <div>phoebe-prototype.vercel.app</div>
          <div>portfolio prototype · synthetic data</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
