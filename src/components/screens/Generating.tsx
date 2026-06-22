"use client";

import type { PlannerApi } from "@/lib/usePlanner";
import { Skeleton } from "@/components/ui/skeleton";

// Per-phase copy + progress, backed by REAL search awaits in usePlanner's
// `surprise()`: phase 0 = querying live flight fares, phase 1 = pricing the
// stays, phase 2 = assembling the trips. genPhase advances as each await
// resolves, so the bar reflects work that actually happened.
const STATUS = [
  "Searching live flight fares…",
  "Pricing real stays…",
  "Assembling your trips…",
];
const PCT = [34, 72, 96];

export function Generating({ planner }: { planner: PlannerApi }) {
  const { genPhase } = planner.state;
  return (
    <div
      data-screen-label="Generating"
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-10 text-center sm:min-h-[80vh]"
    >
      <div className="relative mb-[34px] h-[150px] w-[150px]">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-line" />
        <div className="animate-pp-orbit absolute inset-0">
          <div className="absolute -top-[13px] left-1/2 -translate-x-1/2">
            <svg width="30" height="30" viewBox="0 0 64 64">
              <path d="M8 30 L56 16 L40 36 L36 56 L28 38 Z" fill="var(--accent)" />
            </svg>
          </div>
        </div>
        <div
          className="animate-pp-float absolute inset-[34px] flex items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg,var(--accent2),var(--accent))",
          }}
        >
          <svg width="42" height="42" viewBox="0 0 64 64">
            <rect x="6" y="40" width="9" height="20" rx="2" fill="#fff" opacity=".9" />
            <path d="M11 44 C2 40 1 31 1 31 C8 33 12 37 12 40 Z" fill="#fff" opacity=".9" />
            <path d="M11 42 C9 32 14 24 14 24 C18 31 16 39 13 42 Z" fill="#fff" opacity=".9" />
            <path d="M12 43 C20 36 30 38 30 38 C24 44 16 45 12 44 Z" fill="#fff" opacity=".9" />
          </svg>
        </div>
      </div>
      <div className="font-display mb-2 text-2xl font-extrabold tracking-[-.01em]">
        Finding your paradise
      </div>
      <div className="min-h-[22px] text-[15px] text-ink-soft transition-opacity duration-200">
        {STATUS[genPhase]}
      </div>
      <div className="mt-[26px] h-1.5 w-[200px] overflow-hidden rounded-md bg-line">
        <div
          className="h-full rounded-md bg-primary transition-[width] duration-[800ms] ease-out"
          style={{ width: PCT[genPhase] + "%" }}
        />
      </div>

      {/* Subtle skeleton hint of the results to come. */}
      <div className="mt-9 flex w-full max-w-[240px] flex-col gap-2.5 opacity-50">
        <Skeleton className="h-3 w-3/4 self-center rounded-full" />
        <Skeleton className="h-3 w-1/2 self-center rounded-full" />
      </div>
    </div>
  );
}
