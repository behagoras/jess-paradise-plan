"use client";

import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { ImageSlot } from "../ImageSlot";

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 20,
  padding: "16px 17px",
  marginBottom: 13,
  background: "var(--surface)",
};
const cardTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontWeight: 800,
  fontSize: 15,
};
const editBtn: React.CSSProperties = {
  border: "1px solid var(--accent)",
  background: "var(--surface)",
  color: "var(--accent)",
  fontWeight: 800,
  fontSize: 12,
  padding: "7px 13px",
  borderRadius: 999,
  cursor: "pointer",
};

export function Detail({ planner }: { planner: PlannerApi }) {
  const { computed, state, setState, go } = planner;
  const { dest, air, hot, actPrice, breakdown, grand, perPerson, travelersLabel } =
    computed;

  return (
    <div data-screen-label="Package detail" style={{ padding: "0 0 150px" }}>
      <div style={{ position: "relative", height: 230, background: dest.gradient }}>
        <ImageSlot placeholder={dest.slotHint} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(20,12,6,.66),rgba(20,12,6,0) 58%)",
            pointerEvents: "none",
          }}
        />
        <button
          onClick={() => go("results")}
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,.92)",
            color: "var(--ink)",
            fontSize: 19,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 18,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontFamily: "var(--fd)",
              fontWeight: 800,
              fontSize: 30,
              textShadow: "0 2px 14px rgba(0,0,0,.4)",
            }}
          >
            {dest.name}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,.92)",
              fontSize: 13.5,
              fontWeight: 600,
              textShadow: "0 1px 7px rgba(0,0,0,.5)",
            }}
          >
            {dest.region} · {dest.nights} nights
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 22px 0" }}>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 14.5,
            lineHeight: 1.5,
            color: "var(--ink)",
          }}
        >
          {dest.blurb}
        </p>

        {/* Flight */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 13,
            }}
          >
            <div style={cardTitle}>
              <span style={{ color: "var(--accent)", fontSize: 17 }}>✈</span>
              {air.name}
            </div>
            <button
              onClick={() =>
                setState((s) => ({ ...s, airlineIdx: (s.airlineIdx + 1) % 3 }))
              }
              style={editBtn}
            >
              Edit
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 16 }}>
                  {dest.from}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Jul 2</div>
              </div>
              <div
                style={{ color: "var(--ink-soft)", fontSize: 12, letterSpacing: 1 }}
              >
                •—✈—•
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 16 }}>
                  {dest.to}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Jul 5</div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(air.price)}</div>
          </div>
        </div>

        {/* Hotel */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 9,
            }}
          >
            <div style={cardTitle}>
              <span style={{ color: "var(--accent)", fontSize: 17 }}>⌂</span>
              {hot.name}
            </div>
            <button
              onClick={() =>
                setState((s) => ({ ...s, hotelIdx: (s.hotelIdx + 1) % 3 }))
              }
              style={editBtn}
            >
              Edit
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {hot.room} · {dest.nights} nights
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(hot.price)}</div>
          </div>
        </div>

        {/* Activity */}
        {state.activityOn ? (
          <>
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 9,
                }}
              >
                <div style={cardTitle}>
                  <span style={{ color: "var(--accent)", fontSize: 17 }}>♪</span>
                  {dest.activity}
                </div>
                <button style={editBtn}>Swap</button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  {dest.actDesc}
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(actPrice)}</div>
              </div>
            </div>
            <button
              onClick={() => setState((s) => ({ ...s, activityOn: !s.activityOn }))}
              style={{
                display: "block",
                margin: "-4px auto 16px",
                border: "none",
                background: "transparent",
                color: "var(--ink-soft)",
                fontWeight: 600,
                fontSize: 12.5,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Remove activity
            </button>
          </>
        ) : (
          <button
            onClick={() => setState((s) => ({ ...s, activityOn: !s.activityOn }))}
            style={{
              width: "100%",
              border: "1.5px dashed var(--line)",
              background: "transparent",
              color: "var(--ink-soft)",
              fontWeight: 700,
              fontSize: 14,
              padding: 15,
              borderRadius: 20,
              cursor: "pointer",
              marginBottom: 13,
            }}
          >
            + Add an activity
          </button>
        )}

        {/* Breakdown */}
        <div
          style={{
            background: "var(--surface2)",
            borderRadius: 20,
            padding: "17px 18px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              marginBottom: 13,
            }}
          >
            Price breakdown · {travelersLabel}
          </div>
          {breakdown.map((b) => (
            <div
              key={b.k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: 14,
              }}
            >
              <span style={{ color: "var(--ink-soft)" }}>{b.k}</span>
              <span style={{ fontWeight: 700, color: b.color }}>{b.v}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingTop: 12,
              marginTop: 8,
              borderTop: "1.5px solid var(--line)",
            }}
          >
            <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 17 }}>
              Total
            </span>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontWeight: 800,
                  fontSize: 24,
                  color: "var(--accent)",
                }}
              >
                {fmt(grand)}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                {fmt(perPerson)} per person
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
