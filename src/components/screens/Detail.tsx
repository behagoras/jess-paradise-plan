"use client";

import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { ImageSlot } from "../ImageSlot";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const cardClass =
  "mb-[13px] rounded-[20px] border border-line bg-card px-[17px] py-4";
const cardTitle = "flex items-center gap-[9px] text-[15px] font-extrabold";

function EditButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="cursor-pointer rounded-full border border-primary bg-card px-[13px] py-[7px] text-xs font-extrabold text-primary"
    />
  );
}

export function Detail({ planner }: { planner: PlannerApi }) {
  const { computed, state, setState, go } = planner;
  const { dest, air, hot, actPrice, breakdown, grand, perPerson, travelersLabel } =
    computed;

  return (
    <div data-screen-label="Package detail" className="pb-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:px-7 lg:pt-6">
        {/* Hero */}
        <div
          className="relative h-[230px] lg:sticky lg:top-6 lg:h-[360px] lg:self-start lg:overflow-hidden lg:rounded-[24px]"
          style={{ background: dest.gradient }}
        >
          <ImageSlot src={dest.imageSrc} placeholder={dest.slotHint} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top,rgba(20,12,6,.66),rgba(20,12,6,0) 58%)",
            }}
          />
          <button
            onClick={() => go("results")}
            aria-label="Back"
            className="absolute left-[18px] top-3.5 h-10 w-10 cursor-pointer rounded-full border-none bg-white/90 text-[19px] text-ink"
          >
            ←
          </button>
          <div className="pointer-events-none absolute inset-x-5 bottom-[18px]">
            <div className="font-display text-[30px] font-extrabold text-white [text-shadow:0_2px_14px_rgba(0,0,0,.4)]">
              {dest.name}
            </div>
            <div className="text-[13.5px] font-semibold text-white/90 [text-shadow:0_1px_7px_rgba(0,0,0,.5)]">
              {dest.region} · {dest.nights} nights
            </div>
          </div>
        </div>

        <div className="px-5 pt-[18px] sm:px-7 lg:px-0 lg:pt-0">
          <p className="mb-[18px] text-[14.5px] leading-[1.5] text-ink">
            {dest.blurb}
          </p>

          {/* Flight */}
          <div className={cardClass}>
            <div className="mb-[13px] flex items-center justify-between">
              <div className={cardTitle}>
                <span className="text-[17px] text-primary">✈</span>
                {air.name}
              </div>
              <EditButton
                onClick={() =>
                  setState((s) => ({ ...s, airlineIdx: (s.airlineIdx + 1) % 3 }))
                }
              >
                Edit
              </EditButton>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[11px]">
                <div className="text-center">
                  <div className="font-display text-base font-extrabold">
                    {dest.from}
                  </div>
                  <div className="text-[11px] text-ink-soft">Jul 2</div>
                </div>
                <div className="text-xs tracking-[1px] text-ink-soft">•—✈—•</div>
                <div className="text-center">
                  <div className="font-display text-base font-extrabold">
                    {dest.to}
                  </div>
                  <div className="text-[11px] text-ink-soft">Jul 5</div>
                </div>
              </div>
              <div className="text-[15px] font-extrabold">{fmt(air.price)}</div>
            </div>
          </div>

          {/* Hotel */}
          <div className={cardClass}>
            <div className="mb-[9px] flex items-center justify-between">
              <div className={cardTitle}>
                <span className="text-[17px] text-primary">⌂</span>
                {hot.name}
              </div>
              <EditButton
                onClick={() =>
                  setState((s) => ({ ...s, hotelIdx: (s.hotelIdx + 1) % 3 }))
                }
              >
                Edit
              </EditButton>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[13px] text-ink-soft">
                {hot.room} · {dest.nights} nights
              </div>
              <div className="text-[15px] font-extrabold">{fmt(hot.price)}</div>
            </div>
          </div>

          {/* Activity */}
          {state.activityOn ? (
            <>
              <div className={cardClass}>
                <div className="mb-[9px] flex items-center justify-between">
                  <div className={cardTitle}>
                    <span className="text-[17px] text-primary">♪</span>
                    {dest.activity}
                  </div>
                  <EditButton>Swap</EditButton>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-ink-soft">{dest.actDesc}</div>
                  <div className="text-[15px] font-extrabold">{fmt(actPrice)}</div>
                </div>
              </div>
              <button
                onClick={() =>
                  setState((s) => ({ ...s, activityOn: !s.activityOn }))
                }
                className="mx-auto -mt-1 mb-4 block cursor-pointer text-[12.5px] font-semibold text-ink-soft underline"
              >
                Remove activity
              </button>
            </>
          ) : (
            <button
              onClick={() => setState((s) => ({ ...s, activityOn: !s.activityOn }))}
              className="mb-[13px] w-full cursor-pointer rounded-[20px] border-[1.5px] border-dashed border-line bg-transparent p-[15px] text-sm font-bold text-ink-soft"
            >
              + Add an activity
            </button>
          )}

          {/* Breakdown */}
          <div className="rounded-[20px] bg-surface2 px-[18px] py-[17px]">
            <div className="mb-[13px] text-xs font-extrabold uppercase tracking-[.06em] text-ink-soft">
              Price breakdown · {travelersLabel}
            </div>
            {breakdown.map((b) => (
              <div key={b.k} className="flex justify-between py-1.5 text-sm">
                <span className="text-ink-soft">{b.k}</span>
                <span className="font-bold" style={{ color: b.color }}>
                  {b.v}
                </span>
              </div>
            ))}
            <Separator className="mt-2 bg-line" />
            <div className="flex items-baseline justify-between pt-3">
              <span className="font-display text-[17px] font-extrabold">
                Total
              </span>
              <div className="text-right">
                <div className="font-display text-2xl font-extrabold text-primary">
                  {fmt(grand)}
                </div>
                <div className="text-[11.5px] text-ink-soft">
                  {fmt(perPerson)} per person
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
