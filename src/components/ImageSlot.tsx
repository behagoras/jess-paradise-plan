import type { CSSProperties } from "react";

export function ImageSlot({
  placeholder,
  src,
  objectPosition = "center",
  loading = "lazy",
  style,
}: {
  placeholder?: string;
  src?: string;
  objectPosition?: CSSProperties["objectPosition"];
  loading?: "eager" | "lazy";
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
      {src ? (
        <img
          src={src}
          alt=""
          loading={loading}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition,
          }}
        />
      ) : placeholder ? (
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
