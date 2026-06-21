import type { CSSProperties, ReactNode, RefObject } from "react";
import { StatusBar } from "./StatusBar";

/**
 * The 390×844 device frame with the layered bezel shadow from the source.
 * `scrollRef` is attached to the inner scroll region so the planner can reset
 * scroll position on screen changes.
 */
export function PhoneFrame({
  children,
  bottomBar,
  overlay,
  scrollRef,
}: {
  children: ReactNode;
  bottomBar?: ReactNode;
  overlay?: ReactNode;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const frame: CSSProperties = {
    width: 390,
    maxWidth: "100%",
    height: 844,
    background: "var(--bg)",
    borderRadius: 46,
    overflow: "hidden",
    position: "relative",
    boxShadow:
      "0 30px 70px -24px rgba(40,28,16,.5),0 0 0 11px #1b1712,0 0 0 13px #2c261f",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--fb)",
    color: "var(--ink)",
  };

  return (
    <div style={frame}>
      <StatusBar />
      <div
        ref={scrollRef}
        data-scroll
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {children}
        {overlay}
      </div>
      {bottomBar}
    </div>
  );
}
