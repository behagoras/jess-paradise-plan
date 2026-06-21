"use client";

import { useRef } from "react";
import { usePlanner, fmt } from "@/lib/usePlanner";
import { Button } from "@/components/ui/button";
import { Landing } from "@/components/screens/Landing";
import { Wizard } from "@/components/screens/Wizard";
import { Generating } from "@/components/screens/Generating";
import { Results } from "@/components/screens/Results";
import { Detail } from "@/components/screens/Detail";
import { HandoffSheet } from "@/components/screens/HandoffSheet";

export default function Home() {
  // The page-level scroll container. `usePlanner` resets its scrollTop on every
  // screen change, replacing the old PhoneFrame inner scroll region.
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

  const bottomBar =
    state.screen === "wizard" ? (
      <WizardBar planner={planner} />
    ) : state.screen === "detail" ? (
      <DetailBar planner={planner} />
    ) : null;

  return (
    <div
      ref={scrollRef}
      data-scroll
      className="relative h-[100dvh] overflow-y-auto overflow-x-hidden bg-backdrop"
    >
      {/* Responsive app shell: full-bleed on mobile, centered column on desktop. */}
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-md bg-background text-foreground shadow-[0_0_60px_-30px_rgba(40,28,16,0.45)] sm:my-6 sm:min-h-0 sm:rounded-[28px] sm:max-w-lg lg:max-w-3xl">
        <main className={bottomBar ? "pb-28" : ""}>{body}</main>

        {bottomBar}
      </div>

      {state.screen === "handoff" && <HandoffSheet planner={planner} />}
    </div>
  );
}

function WizardBar({ planner }: { planner: ReturnType<typeof usePlanner> }) {
  const { state, nextStep } = planner;
  const isLast = state.step === 3;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[calc(14px+env(safe-area-inset-bottom))] sm:absolute sm:rounded-b-[28px]">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 pt-3.5 sm:max-w-lg sm:px-6 lg:max-w-3xl">
        <div className="flex-1">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="mr-1.5 inline-block h-2 rounded-[5px] transition-all duration-300"
              style={{
                width: n === state.step ? 22 : 8,
                background: n <= state.step ? "var(--accent)" : "var(--line)",
              }}
            />
          ))}
        </div>
        <Button
          onClick={nextStep}
          size="lg"
          className={
            "font-display h-auto gap-2 rounded-[15px] px-6 py-[15px] text-base font-extrabold " +
            (isLast
              ? "bg-accent2 text-accent2-ink shadow-[0_10px_22px_-10px_var(--accent2)] hover:bg-accent2/90"
              : "")
          }
        >
          {isLast && <span className="text-[19px] font-black">⌕</span>}
          {isLast ? "Surprise me" : "Continue"}
          {!isLast && <span className="text-[17px]">→</span>}
        </Button>
      </div>
    </div>
  );
}

function DetailBar({ planner }: { planner: ReturnType<typeof usePlanner> }) {
  const { computed, go } = planner;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[calc(13px+env(safe-area-inset-bottom))] sm:absolute sm:rounded-b-[28px]">
      <div className="mx-auto flex w-full max-w-md items-center gap-3.5 px-5 pt-3 sm:max-w-lg sm:px-6 lg:max-w-3xl">
        <div>
          <div className="text-[11px] font-bold text-ink-soft">Total from</div>
          <div className="font-display text-xl font-extrabold text-ink">
            {fmt(computed.grand)}
          </div>
        </div>
        <Button
          onClick={() => go("handoff")}
          className="font-display h-auto flex-1 rounded-[15px] py-4 text-base font-extrabold"
        >
          Reserve with {computed.provider}
        </Button>
      </div>
    </div>
  );
}
