"use client";

import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { ImageSlot } from "../ImageSlot";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const cardClass =
  "mb-[13px] rounded-[20px] border border-line bg-card px-[17px] py-4";
const cardTitle = "flex items-center gap-[9px] text-[15px] font-extrabold";

export function Detail({ planner }: { planner: PlannerApi }) {
  const { computed, state, go } = planner;
  const {
    offer,
    breakdown,
    grand,
    perPerson,
    travelersLabel,
    hasPrice,
    nights,
    outDate,
    retDate,
    currency,
  } = computed;

  const includeFlight = state.packages.includes("Flight");
  const includeHotel = state.packages.includes("Hotel");

  // No real offer to show (empty/errored search). Bounce back to Results,
  // which renders the honest widen hint.
  if (!offer) {
    return (
      <div data-screen-label="Package detail" className="px-5 pt-10 sm:px-7">
        <p className="text-[14.5px] leading-[1.5] text-ink-soft">
          No live trip is selected. Head back and widen your filters.
        </p>
        <Button onClick={() => go("results")} className="mt-4">
          Back to trips
        </Button>
      </div>
    );
  }

  const dest = offer.dest;
  const flightPerPerson = offer.flight.price;
  const hotelPerPerson =
    offer.hotel?.priceFrom != null && state.travelers > 0
      ? offer.hotel.priceFrom / state.travelers
      : null;

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
              {[dest.region, nights ? `${nights} nights` : null]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>

        <div className="px-5 pt-[18px] sm:px-7 lg:px-0 lg:pt-0">
          {dest.blurb && (
            <p className="mb-[18px] text-[14.5px] leading-[1.5] text-ink">
              {dest.blurb}
            </p>
          )}

          {/* Flight — real airline, real outbound/return dates from the API. */}
          {includeFlight && (
            <div className={cardClass}>
              <div className="mb-[13px] flex items-center justify-between">
                <div className={cardTitle}>
                  <span className="text-[17px] text-primary">✈</span>
                  {offer.flight.airlineName ?? offer.flight.airline}
                </div>
                <span className="text-[11px] font-bold text-ink-soft">
                  {offer.flight.transfers === 0
                    ? "Nonstop"
                    : `${offer.flight.transfers} stop${
                        offer.flight.transfers > 1 ? "s" : ""
                      }`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[11px]">
                  <div className="text-center">
                    <div className="font-display text-base font-extrabold">
                      {offer.flight.origin}
                    </div>
                    {outDate && (
                      <div className="text-[11px] text-ink-soft">{outDate}</div>
                    )}
                  </div>
                  <div className="text-xs tracking-[1px] text-ink-soft">
                    •—✈—•
                  </div>
                  <div className="text-center">
                    <div className="font-display text-base font-extrabold">
                      {offer.flight.destination}
                    </div>
                    {retDate && (
                      <div className="text-[11px] text-ink-soft">{retDate}</div>
                    )}
                  </div>
                </div>
                <div className="text-[15px] font-extrabold">
                  {fmt(flightPerPerson)}
                </div>
              </div>
            </div>
          )}

          {/* Hotel — only when included AND a real hotel came back. */}
          {includeHotel && offer.hotel && hotelPerPerson != null && (
            <div className={cardClass}>
              <div className="mb-[9px] flex items-center justify-between">
                <div className={cardTitle}>
                  <span className="text-[17px] text-primary">⌂</span>
                  {offer.hotel.hotelName}
                </div>
                {offer.hotel.stars != null && (
                  <span className="text-[11px] font-bold text-star">
                    {"★".repeat(Math.round(offer.hotel.stars))}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-ink-soft">
                  {nights ? `${nights} nights` : "Stay"}
                  {state.travelers > 1 ? ` · ${state.travelers} guests` : ""}
                </div>
                <div className="text-[15px] font-extrabold">
                  {fmt(hotelPerPerson)}
                </div>
              </div>
            </div>
          )}

          {/* Breakdown — built only from the real, included, priced lines. */}
          <div className="rounded-[20px] bg-surface2 px-[18px] py-[17px]">
            <div className="mb-[13px] text-xs font-extrabold uppercase tracking-[.06em] text-ink-soft">
              Price breakdown · {travelersLabel}
            </div>
            {hasPrice ? (
              <>
                {breakdown.map((b) => (
                  <div
                    key={b.k}
                    className="flex justify-between py-1.5 text-sm"
                  >
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
              </>
            ) : (
              <div className="py-1.5 text-sm text-ink-soft">
                No live price available for this selection yet.
              </div>
            )}
          </div>

          <div className="mt-3 text-center text-[11.5px] leading-[1.5] text-ink-soft">
            Live cached {currency.toUpperCase()} fares — confirmed on the
            provider&apos;s site at booking.
          </div>
        </div>
      </div>
    </div>
  );
}
