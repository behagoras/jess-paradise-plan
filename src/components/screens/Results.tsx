"use client";

import { fmt, type PlannerApi, type RealOffer } from "@/lib/usePlanner";
import { windowFromFlight, monthLabel } from "@/lib/trip";
import { ImageSlot } from "../ImageSlot";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/** Real per-person price for a single offer card, respecting the include set. */
function cardPerPerson(
  o: RealOffer,
  travelers: number,
  includeFlight: boolean,
  includeHotel: boolean
): number {
  let total = 0;
  if (includeFlight) total += o.flight.price;
  if (includeHotel && o.hotel?.priceFrom != null && travelers > 0)
    total += o.hotel.priceFrom / travelers;
  return total;
}

export function Results({ planner }: { planner: PlannerApi }) {
  const { computed, state, go, patch, scrollTop } = planner;
  const { offers, widened, empty, errored } = computed;
  const includeFlight = state.packages.includes("Flight");
  const includeHotel = state.packages.includes("Hotel");

  const select = (i: number) => {
    patch({ selected: i, screen: "detail" });
    setTimeout(scrollTop, 0);
  };

  return (
    <div data-screen-label="Results" className="px-5 pt-1.5 pb-8 sm:px-7">
      <div className="flex items-center gap-3.5 pb-1.5 pt-2.5">
        <button
          onClick={() => go("wizard")}
          aria-label="Back"
          className="h-[38px] flex-none cursor-pointer rounded-[11px] border border-line bg-card px-3 text-lg text-ink"
        >
          ←
        </button>
        <div>
          <div className="font-display text-[21px] font-extrabold tracking-[-.01em]">
            {offers.length === 1
              ? "1 surprise trip"
              : `${offers.length} surprise trips`}
          </div>
          <div className="text-[13px] text-ink-soft">
            Live fares from {state.departure}
          </div>
        </div>
      </div>

      {(widened || empty || errored) && (
        <div className="mt-2 rounded-[14px] border border-line bg-surface2 px-4 py-3 text-[12.5px] font-semibold leading-[1.5] text-ink-soft">
          {empty
            ? "No live trips matched your filters from this departure point — widen your budget or trip length, or pick another departure city, to see more."
            : "Few live trips fit your filters — widen your budget or trip length to see more. Showing the closest live fares below."}
        </div>
      )}

      <div className="grid gap-4 pt-2 lg:grid-cols-2 xl:grid-cols-3">
        {offers.map((o, i) => {
          const dest = o.dest;
          const best = i === 0;
          const perPerson = cardPerPerson(
            o,
            state.travelers,
            includeFlight,
            includeHotel
          );
          const win = windowFromFlight(o.flight, dest.nights || 3);
          const dateWindow = `${monthLabel(o.flight.departureAt)}${
            o.flight.returnAt ? ` – ${monthLabel(o.flight.returnAt)}` : ""
          }`;
          return (
            <Card
              key={dest.key}
              className="gap-0 overflow-hidden rounded-[24px] border-line py-0 shadow-[0_12px_28px_-20px_rgba(40,28,16,.5)]"
            >
              <div
                className="relative h-[188px]"
                style={{ background: dest.gradient }}
              >
                <ImageSlot src={dest.imageSrc} placeholder={dest.slotHint} />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top,rgba(20,12,6,.62),rgba(20,12,6,0) 55%)",
                  }}
                />
                {best && (
                  <div className="pointer-events-none absolute left-[13px] top-[13px] flex gap-[7px]">
                    <Badge className="rounded-full bg-primary px-[11px] py-1.5 text-[11.5px] font-extrabold text-primary-foreground">
                      Best match
                    </Badge>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-[15px] bottom-[13px] flex items-end justify-between">
                  <div>
                    <div className="font-display text-[23px] font-extrabold text-white [text-shadow:0_2px_12px_rgba(0,0,0,.4)]">
                      {dest.name}
                    </div>
                    {dest.region && (
                      <div className="text-[12.5px] font-semibold text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,.5)]">
                        {dest.region}
                      </div>
                    )}
                  </div>
                  {dest.rating && (
                    <div className="flex items-center gap-1 rounded-full bg-white/90 px-[9px] py-[5px] text-xs font-extrabold text-ink">
                      <span className="text-star">★</span>
                      {dest.rating}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col px-[17px] pb-[17px] pt-[15px]">
                {dest.blurb && (
                  <p className="mb-[13px] text-sm leading-[1.45] text-ink">
                    {dest.blurb}
                  </p>
                )}
                <div className="mb-[15px] flex flex-col gap-2">
                  {includeFlight && (
                    <Row
                      icon="✈"
                      label="Flight"
                      value={o.flight.airlineName ?? o.flight.airline}
                    />
                  )}
                  {includeHotel && o.hotel && (
                    <Row icon="⌂" label="Stay" value={o.hotel.hotelName} />
                  )}
                </div>
                <Separator className="mt-auto bg-line" />
                <div className="flex items-center justify-between pt-[13px]">
                  <div>
                    <div className="text-[11px] font-bold text-ink-soft">
                      {win.nights} nights · {dateWindow}
                    </div>
                    <div className="flex items-baseline gap-[7px]">
                      <span className="font-display text-[21px] font-extrabold text-ink">
                        {fmt(perPerson)}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-soft">
                        /person
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => select(i)}
                    className="h-auto rounded-[13px] px-5 py-3 text-sm font-extrabold"
                  >
                    Select
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 text-center text-xs leading-[1.5] text-ink-soft">
        Live cached fares — indicative and a few hours old.
        <br />
        Final price is confirmed on the provider&apos;s site.
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[13px]">
      <span className="flex-none basis-[22px] text-primary">{icon}</span>
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto text-right font-bold">{value}</span>
    </div>
  );
}
