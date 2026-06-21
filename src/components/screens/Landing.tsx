"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { HOW_IT_WORKS } from "@/lib/data";
import { LogoLockup } from "../Logo";
import { ImageSlot } from "../ImageSlot";
import type { PlannerApi } from "@/lib/usePlanner";

export function Landing({ planner }: { planner: PlannerApi }) {
  return (
    <div
      data-screen-label="Landing"
      style={{ padding: "8px 22px 120px", animation: "pp-up .4s ease both" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <LogoLockup />
        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                border: "1.5px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink-soft)",
                fontWeight: 700,
                fontSize: 12,
                padding: "8px 13px",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 28,
          overflow: "hidden",
          height: 340,
          background: "linear-gradient(150deg,#F0876B,#F2B25A 45%,#2FC1C9)",
          boxShadow: "0 18px 40px -18px rgba(240,84,45,.5)",
        }}
      >
        <ImageSlot placeholder="Drop a hero beach photo" />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(20,12,6,.72) 6%,rgba(20,12,6,.12) 48%,rgba(20,12,6,.28))",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 18,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(255,255,255,.92)",
            padding: "7px 12px",
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 800,
            color: "var(--ink)",
            letterSpacing: ".02em",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent)",
              animation: "pp-pulse 1.6s infinite",
            }}
          />
          1,240 trips matched this week
        </div>
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 22,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--fd)",
              fontWeight: 800,
              color: "#fff",
              fontSize: 33,
              lineHeight: 1.02,
              letterSpacing: "-.01em",
              textShadow: "0 2px 18px rgba(0,0,0,.35)",
            }}
          >
            Don&apos;t pick where.
            <br />
            Pick the feeling.
          </div>
          <div
            style={{
              color: "rgba(255,255,255,.92)",
              fontSize: 14.5,
              marginTop: 9,
              maxWidth: 280,
              lineHeight: 1.4,
              textShadow: "0 1px 8px rgba(0,0,0,.4)",
            }}
          >
            Tell us your budget and your vibe. We hand you a trip, ready to book.
          </div>
        </div>
      </div>

      <button
        onClick={planner.startWizard}
        style={{
          marginTop: 18,
          width: "100%",
          border: "none",
          background: "var(--accent)",
          color: "var(--accent-ink)",
          fontFamily: "var(--fd)",
          fontWeight: 800,
          fontSize: 19,
          letterSpacing: ".01em",
          padding: 18,
          borderRadius: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: "0 12px 26px -10px var(--accent)",
        }}
      >
        Get started <span style={{ fontSize: 21 }}>→</span>
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "center",
          margin: "16px 0 22px",
          color: "var(--ink-soft)",
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        how it works
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>

      {HOW_IT_WORKS.map((s) => (
        <div
          key={s.n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 18,
            padding: "15px 17px",
            marginBottom: 11,
          }}
        >
          <div
            style={{
              flex: "0 0 40px",
              height: 40,
              borderRadius: 12,
              background: "var(--surface2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--fd)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--accent)",
            }}
          >
            {s.n}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{s.title}</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-soft)",
                lineHeight: 1.35,
                marginTop: 2,
              }}
            >
              {s.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
