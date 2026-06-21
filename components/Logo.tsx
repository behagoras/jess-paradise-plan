/** The Paradise Plan palm + plane mark, transcribed from the source SVG. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g>
        <rect x="6" y="40" width="9" height="20" rx="2" fill="var(--palm)" />
        <path d="M11 44 C2 40 1 31 1 31 C8 33 12 37 12 40 Z" fill="var(--palm)" />
        <path d="M11 42 C9 32 14 24 14 24 C18 31 16 39 13 42 Z" fill="var(--palm)" />
        <path d="M12 43 C20 36 30 38 30 38 C24 44 16 45 12 44 Z" fill="var(--palm)" />
        <rect x="22" y="30" width="30" height="22" rx="4" fill="var(--accent2)" />
        <rect
          x="33"
          y="24"
          width="8"
          height="8"
          rx="4"
          fill="none"
          stroke="var(--accent2)"
          strokeWidth="3"
        />
        <path d="M18 24 L52 44 L46 47 L14 30 Z" fill="var(--accent)" />
        <path d="M48 21 L54 38 L44 30 Z" fill="var(--accent)" />
      </g>
    </svg>
  );
}

/** White plane glyph used by the generating + handoff screens. */
export function PlaneGlyph({ size = 30, fill = "var(--accent)" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path d="M8 30 L56 16 L40 36 L36 56 L28 38 Z" fill={fill} />
    </svg>
  );
}

/** Word-lockup used in the landing header. */
export function LogoLockup() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <LogoMark size={36} />
      <div style={{ lineHeight: 0.84 }}>
        <div
          style={{
            fontFamily: "var(--fd)",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: ".01em",
          }}
        >
          PARADISE
        </div>
        <div
          style={{
            fontFamily: "var(--fd)",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: ".18em",
          }}
        >
          PLAN
        </div>
      </div>
    </div>
  );
}
