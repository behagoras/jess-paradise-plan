"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { PlaneGlyph } from "../Logo";

export function HandoffSheet({ planner }: { planner: PlannerApi }) {
  const { computed, state, go } = planner;
  const { dest, provider, grand, travelersLabel } = computed;
  const saveTrip = useMutation(api.trips.save);
  const [saving, setSaving] = useState(false);

  const close = (e?: React.MouseEvent) => {
    if (!e || e.target === e.currentTarget) go("detail");
  };

  const confirm = async () => {
    setSaving(true);
    try {
      await saveTrip({
        destinationKey: dest.key,
        destinationName: dest.name,
        region: dest.region,
        provider,
        travelers: state.travelers,
        total: Math.round(computed.grand),
        perPerson: Math.round(computed.perPerson),
        when: state.when,
        departure: state.departure,
        activityOn: state.activityOn,
      });
    } catch {
      // Soft-fail: in the design flow the hand-off proceeds regardless.
    } finally {
      // Real app would window.open the provider deep link here.
      setSaving(false);
      go("detail");
    }
  };

  return (
    <div
      data-screen-label="Hand-off"
      onClick={close}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background: "rgba(20,12,6,.5)",
        animation: "pp-up .25s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "30px 30px 0 0",
          padding: "26px 24px calc(28px + env(safe-area-inset-bottom))",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            borderRadius: 5,
            background: "var(--line)",
            margin: "0 auto 22px",
          }}
        />
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 22,
            margin: "0 auto 18px",
            background: "linear-gradient(135deg,var(--accent2),var(--accent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlaneGlyph size={40} fill="#fff" />
        </div>
        <h2
          style={{
            fontFamily: "var(--fd)",
            fontWeight: 800,
            fontSize: 23,
            margin: "0 0 8px",
            letterSpacing: "-.01em",
          }}
        >
          Off to {provider}
        </h2>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 14.5,
            lineHeight: 1.5,
            margin: "0 auto 20px",
            maxWidth: 300,
          }}
        >
          We hand you to {provider} to finish booking {dest.name}. Your
          selections carry over. The final price is confirmed on their site.
        </p>
        <div
          style={{
            background: "var(--surface2)",
            borderRadius: 16,
            padding: "14px 17px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {dest.name} · {travelersLabel}
          </span>
          <span
            style={{
              fontFamily: "var(--fd)",
              fontWeight: 800,
              fontSize: 19,
              color: "var(--accent)",
            }}
          >
            {fmt(grand)}
          </span>
        </div>

        <button onClick={confirm} disabled={saving} style={primaryBtn}>
          {saving ? "Saving…" : `Continue to ${provider} →`}
        </button>

        <button
          onClick={() => close()}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            color: "var(--ink-soft)",
            fontWeight: 700,
            fontSize: 14,
            padding: 6,
            cursor: "pointer",
          }}
        >
          Keep editing
        </button>
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "var(--accent)",
  color: "var(--accent-ink)",
  fontFamily: "var(--fd)",
  fontWeight: 800,
  fontSize: 17,
  padding: 17,
  borderRadius: 16,
  cursor: "pointer",
  marginBottom: 11,
};
