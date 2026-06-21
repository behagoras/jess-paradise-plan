"use client";

import { DEST_BASE } from "@/lib/data";
import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { ImageSlot } from "../ImageSlot";

export function Results({ planner }: { planner: PlannerApi }) {
  const { computed, go, patch, scrollTop } = planner;
  const { options, disc } = computed;

  const select = (i: number) => {
    patch({
      selected: i,
      screen: "detail",
      airlineIdx: 0,
      hotelIdx: 0,
      activityOn: true,
    });
    setTimeout(scrollTop, 0);
  };

  return (
    <div data-screen-label="Results" style={{ padding: "6px 22px 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 0 6px",
        }}
      >
        <button
          onClick={() => go("wizard")}
          style={{
            flex: "0 0 38px",
            height: 38,
            borderRadius: 11,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontWeight: 800,
              fontSize: 21,
              letterSpacing: "-.01em",
            }}
          >
            {options.length} surprise trips
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            Matched to your vibe and budget
          </div>
        </div>
      </div>

      {options.map((o, i) => {
        const b = DEST_BASE[o.key];
        const from = Math.round(b * (1 - disc));
        const best = i === 0;
        return (
          <div
            key={o.key}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              overflow: "hidden",
              marginTop: 16,
              boxShadow: "0 12px 28px -20px rgba(40,28,16,.5)",
            }}
          >
            <div style={{ position: "relative", height: 188, background: o.gradient }}>
              <ImageSlot placeholder={o.slotHint} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top,rgba(20,12,6,.62),rgba(20,12,6,0) 55%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 13,
                  left: 13,
                  display: "flex",
                  gap: 7,
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    background: best ? "var(--accent)" : "rgba(255,255,255,.92)",
                    color: best ? "var(--accent-ink)" : "var(--ink)",
                    fontWeight: 800,
                    fontSize: 11.5,
                    padding: "6px 11px",
                    borderRadius: 999,
                  }}
                >
                  {best ? "Best match" : "Great deal"}
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,.92)",
                    color: "var(--ink)",
                    fontWeight: 800,
                    fontSize: 11.5,
                    padding: "6px 10px",
                    borderRadius: 999,
                  }}
                >
                  −{Math.round(disc * 100)}%
                </span>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 13,
                  left: 15,
                  right: 15,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  pointerEvents: "none",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontFamily: "var(--fd)",
                      fontWeight: 800,
                      fontSize: 23,
                      textShadow: "0 2px 12px rgba(0,0,0,.4)",
                    }}
                  >
                    {o.name}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,.92)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      textShadow: "0 1px 6px rgba(0,0,0,.5)",
                    }}
                  >
                    {o.region}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(255,255,255,.92)",
                    padding: "5px 9px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "var(--ink)",
                  }}
                >
                  <span style={{ color: "var(--star)" }}>★</span>
                  {o.rating}
                </div>
              </div>
            </div>
            <div style={{ padding: "15px 17px 17px" }}>
              <p
                style={{
                  margin: "0 0 13px",
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: "var(--ink)",
                }}
              >
                {o.blurb}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 15,
                }}
              >
                <Row icon="✈" label="Flight" value={o.airline} />
                <Row icon="⌂" label="Stay" value={o.hotel} />
                <Row icon="♪" label="Do" value={o.activity} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 13,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-soft)",
                      fontWeight: 700,
                    }}
                  >
                    Departs in {o.departsIn} days · {o.seats} seats left
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--ink-soft)",
                        textDecoration: "line-through",
                      }}
                    >
                      {fmt(b)}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--fd)",
                        fontWeight: 800,
                        fontSize: 21,
                        color: "var(--ink)",
                      }}
                    >
                      {fmt(from)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--ink-soft)",
                        fontWeight: 600,
                      }}
                    >
                      /person
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => select(i)}
                  style={{
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    fontWeight: 800,
                    fontSize: 14,
                    padding: "12px 20px",
                    borderRadius: 13,
                    cursor: "pointer",
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          textAlign: "center",
          color: "var(--ink-soft)",
          fontSize: 12,
          marginTop: 20,
          lineHeight: 1.5,
        }}
      >
        Prices shown are &quot;from&quot; estimates.
        <br />
        Final price is confirmed on the provider&apos;s site.
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
      <span style={{ flex: "0 0 22px", color: "var(--accent)" }}>{icon}</span>
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <span style={{ fontWeight: 700, marginLeft: "auto", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
