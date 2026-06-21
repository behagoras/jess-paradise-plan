import type { CSSProperties } from "react";

/**
 * Stand-in for the source `<image-slot>` custom element. In the design tool
 * this was a drop target for a real photo; here it renders the gradient that
 * sits behind it plus the placeholder hint, so the layout is faithful without
 * a CMS. Swap for next/image once real photography is wired in.
 */
export function ImageSlot({
  placeholder,
  style,
}: {
  placeholder?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {placeholder ? (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,.82)",
            background: "rgba(20,12,6,.22)",
            padding: "6px 12px",
            borderRadius: 999,
            backdropFilter: "blur(2px)",
          }}
        >
          {placeholder}
        </span>
      ) : null}
    </div>
  );
}
