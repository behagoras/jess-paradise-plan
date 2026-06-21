import type { CSSProperties } from "react";

/**
 * Paradise — the single brand palette transcribed from `Paradise Plan.dc.html`.
 * The original file shipped four themes (Paradise / Ocean / Jungle / Midnight);
 * per the brief we ship only Paradise. These values are injected as CSS custom
 * properties on the app root (see `app/globals.css` :root and PhoneFrame).
 */
export const PARADISE = {
  bg: "#FBF5EC",
  surface: "#FFFFFF",
  surface2: "#FBF3E9",
  ink: "#211B14",
  "ink-soft": "#86796B",
  line: "#EBE0D0",
  accent: "#F0542D",
  "accent-ink": "#FFF6F0",
  accent2: "#EED350",
  "accent2-ink": "#2A2406",
  palm: "#1E8E5A",
  star: "#EAB308",
  backdrop: "#E7DDCD",
} as const;

export const FONTS = {
  display:
    "'Arial Rounded MT Bold','Hiragino Maru Gothic ProN',system-ui,sans-serif",
  body: "system-ui,-apple-system,'Segoe UI',sans-serif",
} as const;

/**
 * Selectable "pill" chip style. Mirrors the `chip(active, accent2)` helper from
 * the source. `accent2` swaps the orange selection for the yellow accent (used
 * by the Weather chips in step 2).
 */
export function chip(active: boolean, accent2 = false): CSSProperties {
  return {
    padding: "11px 16px",
    borderRadius: 999,
    border: `1.5px solid ${
      active ? (accent2 ? "var(--accent2)" : "var(--accent)") : "var(--line)"
    }`,
    background: active
      ? accent2
        ? "var(--accent2)"
        : "var(--accent)"
      : "var(--surface)",
    color: active
      ? accent2
        ? "var(--accent2-ink)"
        : "var(--accent-ink)"
      : "var(--ink)",
    fontFamily: "var(--fb)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all .15s",
  };
}

/** Shared uppercase field-label style used throughout the wizard. */
export const fieldLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--ink-soft)",
  marginBottom: 11,
};
