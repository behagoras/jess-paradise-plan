/** iOS-style status bar (notch + 9:41 + signal/battery) from the source. */
export function StatusBar() {
  return (
    <div
      style={{
        height: 48,
        flex: "0 0 48px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "0 26px 6px",
        fontSize: 14,
        fontWeight: 700,
        color: "var(--ink)",
        position: "relative",
        zIndex: 5,
      }}
    >
      <span>9:41</span>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 9,
          transform: "translateX(-50%)",
          width: 104,
          height: 26,
          background: "#1b1712",
          borderRadius: 14,
        }}
      />
      <span
        style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}
      >
        <span style={{ letterSpacing: 1 }}>●●●</span>
        <span>5G</span>
        <span
          style={{
            display: "inline-block",
            width: 22,
            height: 11,
            border: "1.5px solid var(--ink)",
            borderRadius: 3,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: "1.5px",
              right: 5,
              background: "var(--ink)",
              borderRadius: 1,
            }}
          />
        </span>
      </span>
    </div>
  );
}
