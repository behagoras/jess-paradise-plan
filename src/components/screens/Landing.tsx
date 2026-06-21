"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { HOW_IT_WORKS } from "@/lib/data";
import { LogoLockup } from "../Logo";
import { ImageSlot } from "../ImageSlot";
import { Button } from "@/components/ui/button";
import type { PlannerApi } from "@/lib/usePlanner";

export function Landing({ planner }: { planner: PlannerApi }) {
  return (
    <div
      data-screen-label="Landing"
      className="animate-pp-up px-5 pt-2 pb-12 sm:px-7 sm:pt-4"
    >
      {/* Below lg the in-content brand + auth live here; on desktop the
          persistent BrandRail and shell auth control take over. */}
      <div className="mb-[18px] flex items-center justify-between lg:hidden">
        <LogoLockup />
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="h-auto rounded-full border-[1.5px] border-line bg-card px-[13px] py-2 text-xs font-bold text-ink-soft"
            >
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      {/* Hero. On desktop the rail carries the tagline + live badge, so here
          the hero becomes a shorter image banner to avoid duplication. */}
      <div
        className="relative h-[300px] overflow-hidden rounded-[28px] shadow-[0_18px_40px_-18px_rgba(240,84,45,.5)] sm:h-[360px] lg:mt-2 lg:h-[280px]"
        style={{
          background: "linear-gradient(150deg,#F0876B,#F2B25A 45%,#2FC1C9)",
        }}
      >
        <ImageSlot
          src="/images/trips/hero-beach.webp"
          placeholder="Drop a hero beach photo"
          loading="eager"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top,rgba(20,12,6,.72) 6%,rgba(20,12,6,.12) 48%,rgba(20,12,6,.28))",
          }}
        />
        <div className="pointer-events-none absolute left-[18px] top-[18px] inline-flex items-center gap-[7px] rounded-full bg-white/90 px-3 py-[7px] text-[11.5px] font-extrabold tracking-[.02em] text-ink lg:hidden">
          <span className="animate-pp-pulse h-[7px] w-[7px] rounded-full bg-primary" />
          1,240 trips matched this week
        </div>
        <div className="pointer-events-none absolute inset-x-[22px] bottom-[22px] lg:hidden">
          <div className="font-display text-[33px] font-extrabold leading-[1.02] tracking-[-.01em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,.35)] sm:text-[40px] lg:text-[52px]">
            Don&apos;t pick where.
            <br />
            Pick the feeling.
          </div>
          <div className="mt-[9px] max-w-[280px] text-[14.5px] leading-[1.4] text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,.4)] sm:max-w-sm sm:text-base">
            Tell us your budget and your vibe. We hand you a trip, ready to book.
          </div>
        </div>
      </div>

      <Button
        onClick={planner.startWizard}
        className="font-display mt-[18px] h-auto w-full gap-2.5 rounded-[18px] py-[18px] text-[19px] font-extrabold tracking-[.01em] shadow-[0_12px_26px_-10px_var(--accent)]"
      >
        Get started <span className="text-[21px]">→</span>
      </Button>

      <div className="my-[19px] flex items-center justify-center gap-2.5 text-[12.5px] font-semibold text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        how it works
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-[11px] lg:grid-cols-3">
        {HOW_IT_WORKS.map((s) => (
          <div
            key={s.n}
            className="flex items-center gap-[15px] rounded-[18px] border border-line bg-card px-[17px] py-[15px]"
          >
            <div className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-surface2 text-[18px] font-extrabold text-primary">
              {s.n}
            </div>
            <div>
              <div className="text-[15px] font-extrabold">{s.title}</div>
              <div className="mt-0.5 text-[13px] leading-[1.35] text-ink-soft">
                {s.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
