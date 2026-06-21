"use client";

import { useRef } from "react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { usePlanner, fmt, WIZARD_STEPS } from "@/lib/usePlanner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandRail } from "@/components/BrandRail";
import { Landing } from "@/components/screens/Landing";
import { Wizard } from "@/components/screens/Wizard";
import { Generating } from "@/components/screens/Generating";
import { Results } from "@/components/screens/Results";
import { Detail } from "@/components/screens/Detail";
import { HandoffSheet } from "@/components/screens/HandoffSheet";

/**
 * Screen registry — how to add a screen to this app:
 *   1. Add the screen name to the `Screen` union in src/lib/usePlanner.ts.
 *   2. Add a `case` to the `body` switch below mapping it to its component.
 *   3. If it needs a bottom bar, add a branch to the `bottomBar` ternary and a
 *      matching `*Bar` component (see WizardBar / DetailBar).
 *   4. If it wants a different desktop width, add it to the `stageMax` ternary.
 * Overlay screens (e.g. "handoff") render *outside* the stage as a sibling at
 * the bottom of the tree — see the `state.screen === "handoff"` line — rather
 * than as a `body` case, so they float over the current screen.
 */
export default function Home() {
  // The page-level scroll container. `usePlanner` resets its scrollTop on every
  // screen change, replacing the old PhoneFrame inner scroll region. On desktop
  // this same element becomes the right-hand content stage (flex-1) so the
  // scroll reset keeps working in both layouts with no change to usePlanner.
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

  // Desktop content width adapts to the screen: forms read best narrow, while
  // the results grid and side-by-side detail want the extra room.
  const stageMax =
    state.screen === "results"
      ? "lg:max-w-5xl"
      : state.screen === "detail" || state.screen === "handoff"
        ? "lg:max-w-4xl"
        : "lg:max-w-2xl";

  return (
    <div className="bg-backdrop lg:flex lg:h-[100dvh] lg:overflow-hidden">
      {/* Persistent atmospheric brand rail — desktop only. */}
      <BrandRail className="hidden lg:flex lg:w-[40%] lg:max-w-[600px] xl:w-[44%]" />

      {/* Content stage / scroll container: full-bleed on mobile, a floating
          card on tablet, the full-height right pane on desktop. */}
      <div
        ref={scrollRef}
        data-scroll
        className="relative h-[100dvh] overflow-y-auto overflow-x-hidden bg-backdrop lg:flex-1 lg:bg-background"
      >
        <div
          className={cn(
            "relative mx-auto min-h-[100dvh] w-full max-w-md bg-background text-foreground shadow-[0_0_60px_-30px_rgba(40,28,16,0.45)]",
            "sm:my-6 sm:min-h-0 sm:max-w-lg sm:rounded-[28px]",
            "lg:my-0 lg:min-h-[100dvh] lg:rounded-none lg:shadow-none",
            stageMax,
          )}
        >
          <main className={bottomBar ? "pb-28" : ""}>{body}</main>

          {bottomBar}
        </div>
      </div>

      {/* Persistent auth control, pinned over the stage on desktop. */}
      <div className="fixed right-6 top-6 z-40 hidden lg:block">
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="h-auto rounded-full border-[1.5px] border-line bg-card/90 px-4 py-2 text-xs font-bold text-ink-soft shadow-sm backdrop-blur"
            >
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      {state.screen === "handoff" && <HandoffSheet planner={planner} />}
    </div>
  );
}

function WizardBar({ planner }: { planner: ReturnType<typeof usePlanner> }) {
  const { state, nextStep } = planner;
  const isLast = state.step === WIZARD_STEPS;
  // One-line honest micro-summary of the inputs that actually drive output.
  const summary = [
    state.general.length ? state.general.join(", ") : "Any vibe",
    state.weather.length ? state.weather.join("/") + " weather" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[calc(14px+env(safe-area-inset-bottom))] sm:absolute sm:inset-x-0 sm:rounded-b-[28px] lg:rounded-none">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 pt-3.5 sm:max-w-lg sm:px-6 lg:max-w-2xl">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5">
            {Array.from({ length: WIZARD_STEPS }, (_, i) => i + 1).map((n) => (
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
          {isLast && (
            <div className="truncate text-[11px] font-semibold text-ink-soft">
              {summary}
            </div>
          )}
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
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[calc(13px+env(safe-area-inset-bottom))] sm:absolute sm:inset-x-0 sm:rounded-b-[28px] lg:rounded-none">
      <div className="mx-auto flex w-full max-w-md items-center gap-3.5 px-5 pt-3 sm:max-w-lg sm:px-6 lg:max-w-4xl">
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
