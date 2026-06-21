"use client";

import type { PlannerApi } from "@/lib/usePlanner";

const STATUS = [
  "Scanning 1,240 trips...",
  "Pricing flexible departures...",
  "Locking in your package...",
];
const PCT = [28, 64, 96];

export function Generating({ planner }: { planner: PlannerApi }) {
  const { genPhase } = planner.state;
  return (
    <div
      data-screen-label="Generating"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        background: "var(--bg)",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", width: 150, height: 150, marginBottom: 34 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px dashed var(--line)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            animation: "pp-orbit 2.4s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -13,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 64 64">
              <path d="M8 30 L56 16 L40 36 L36 56 L28 38 Z" fill="var(--accent)" />
            </svg>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg,var(--accent2),var(--accent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pp-float 2.6s ease-in-out infinite",
          }}
        >
          <svg width="42" height="42" viewBox="0 0 64 64">
            <rect x="6" y="40" width="9" height="20" rx="2" fill="#fff" opacity=".9" />
            <path d="M11 44 C2 40 1 31 1 31 C8 33 12 37 12 40 Z" fill="#fff" opacity=".9" />
            <path d="M11 42 C9 32 14 24 14 24 C18 31 16 39 13 42 Z" fill="#fff" opacity=".9" />
            <path d="M12 43 C20 36 30 38 30 38 C24 44 16 45 12 44 Z" fill="#fff" opacity=".9" />
          </svg>
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--fd)",
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: "-.01em",
          marginBottom: 8,
        }}
      >
        Finding your paradise
      </div>
      <div
        style={{
          color: "var(--ink-soft)",
          fontSize: 15,
          minHeight: 22,
          transition: "opacity .2s",
        }}
      >
        {STATUS[genPhase]}
      </div>
      <div
        style={{
          width: 200,
          height: 6,
          borderRadius: 6,
          background: "var(--line)",
          overflow: "hidden",
          marginTop: 26,
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--accent)",
            borderRadius: 6,
            transition: "width .8s ease",
            width: PCT[genPhase] + "%",
          }}
        />
      </div>
    </div>
  );
}
