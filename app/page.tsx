"use client";

import { useRef } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { usePlanner, fmt } from "@/lib/usePlanner";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Landing } from "@/components/screens/Landing";
import { Wizard } from "@/components/screens/Wizard";
import { Generating } from "@/components/screens/Generating";
import { Results } from "@/components/screens/Results";
import { Detail } from "@/components/screens/Detail";
import { HandoffSheet } from "@/components/screens/HandoffSheet";

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const planner = usePlanner(scrollRef);
  const { state } = planner;

  const body = (() => {
    switch (state.screen) {
      case "landing":
        return <Landing planner={planner} />;
      case "wizard":
        return <Wizard planner={planner} />;
      case "generating":
        return <Generating planner={planner} />;
      case "results":
        return <Results planner={planner} />;
      case "detail":
      case "handoff":
        return <Detail planner={planner} />;
      default:
        return null;
    }
  })();

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--backdrop)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 18,
        padding: "30px 20px 44px",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--accent)",
                fontFamily: "var(--fd)",
                fontWeight: 700,
                fontSize: 14,
                padding: "9px 16px",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              style={{
                border: "none",
                background: "var(--accent)",
                color: "var(--accent-ink)",
                fontFamily: "var(--fd)",
                fontWeight: 800,
                fontSize: 14,
                padding: "9px 16px",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Sign up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </header>
      <PhoneFrame
        scrollRef={scrollRef}
        overlay={state.screen === "handoff" ? <HandoffSheet planner={planner} /> : null}
        bottomBar={
          state.screen === "wizard" ? (
            <WizardBar planner={planner} />
          ) : state.screen === "detail" ? (
            <DetailBar planner={planner} />
          ) : null
        }
      >
        {body}
      </PhoneFrame>
    </main>
  );
}

function WizardBar({ planner }: { planner: ReturnType<typeof usePlanner> }) {
  const { state, nextStep } = planner;
  const isLast = state.step === 3;
  return (
    <div
      style={{
        flex: "0 0 auto",
        padding: "14px 22px calc(14px + env(safe-area-inset-bottom))",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            style={{
              display: "inline-block",
              width: n === state.step ? 22 : 8,
              height: 8,
              borderRadius: 5,
              marginRight: 6,
              background: n <= state.step ? "var(--accent)" : "var(--line)",
              transition: "all .25s",
            }}
          />
        ))}
      </div>
      <button
        onClick={nextStep}
        style={{
          border: "none",
          fontFamily: "var(--fd)",
          fontWeight: 800,
          fontSize: 16,
          padding: "15px 24px",
          borderRadius: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          ...(isLast
            ? {
                background: "var(--accent2)",
                color: "var(--accent2-ink)",
                boxShadow: "0 10px 22px -10px var(--accent2)",
              }
            : { background: "var(--accent)", color: "var(--accent-ink)" }),
        }}
      >
        {isLast && <span style={{ fontSize: 19, fontWeight: 900 }}>⌕</span>}
        {isLast ? "Surprise me" : "Continue"}
        {!isLast && <span style={{ fontSize: 17 }}>→</span>}
      </button>
    </div>
  );
}

function DetailBar({ planner }: { planner: ReturnType<typeof usePlanner> }) {
  const { computed, go } = planner;
  return (
    <div
      style={{
        flex: "0 0 auto",
        padding: "13px 22px calc(13px + env(safe-area-inset-bottom))",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        display: "flex",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700 }}>
          Total from
        </div>
        <div
          style={{
            fontFamily: "var(--fd)",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--ink)",
          }}
        >
          {fmt(computed.grand)}
        </div>
      </div>
      <button
        onClick={() => go("handoff")}
        style={{
          flex: 1,
          border: "none",
          background: "var(--accent)",
          color: "var(--accent-ink)",
          fontFamily: "var(--fd)",
          fontWeight: 800,
          fontSize: 16,
          padding: 16,
          borderRadius: 15,
          cursor: "pointer",
        }}
      >
        Reserve with {computed.provider}
      </button>
    </div>
  );
}
