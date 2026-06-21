"use client";

import { DEST_BASE } from "@/lib/data";
import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { ImageSlot } from "../ImageSlot";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Results({ planner }: { planner: PlannerApi }) {
  const { computed, go, patch, scrollTop } = planner;
  const { options, disc } = computed;

  const select = (i: number) => {
    patch({
      selected: i,
      screen: "detail",
      airlineIdx: 0,
      hotelIdx: 0,
      activityOn: true,
    });
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
            {options.length} surprise trips
          </div>
          <div className="text-[13px] text-ink-soft">
            Matched to your vibe and budget
          </div>
        </div>
      </div>

      <div className="grid gap-4 pt-2 lg:grid-cols-3">
        {options.map((o, i) => {
          const b = DEST_BASE[o.key];
          const from = Math.round(b * (1 - disc));
          const best = i === 0;
          return (
            <Card
              key={o.key}
              className="gap-0 overflow-hidden rounded-[24px] border-line py-0 shadow-[0_12px_28px_-20px_rgba(40,28,16,.5)]"
            >
              <div
                className="relative h-[188px]"
                style={{ background: o.gradient }}
              >
                <ImageSlot placeholder={o.slotHint} />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top,rgba(20,12,6,.62),rgba(20,12,6,0) 55%)",
                  }}
                />
                <div className="pointer-events-none absolute left-[13px] top-[13px] flex gap-[7px]">
                  <Badge
                    className={
                      "rounded-full px-[11px] py-1.5 text-[11.5px] font-extrabold " +
                      (best
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/90 text-ink")
                    }
                  >
                    {best ? "Best match" : "Great deal"}
                  </Badge>
                  <Badge className="rounded-full bg-white/90 px-2.5 py-1.5 text-[11.5px] font-extrabold text-ink">
                    −{Math.round(disc * 100)}%
                  </Badge>
                </div>
                <div className="pointer-events-none absolute inset-x-[15px] bottom-[13px] flex items-end justify-between">
                  <div>
                    <div className="font-display text-[23px] font-extrabold text-white [text-shadow:0_2px_12px_rgba(0,0,0,.4)]">
                      {o.name}
                    </div>
                    <div className="text-[12.5px] font-semibold text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,.5)]">
                      {o.region}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white/90 px-[9px] py-[5px] text-xs font-extrabold text-ink">
                    <span className="text-star">★</span>
                    {o.rating}
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col px-[17px] pb-[17px] pt-[15px]">
                <p className="mb-[13px] text-sm leading-[1.45] text-ink">
                  {o.blurb}
                </p>
                <div className="mb-[15px] flex flex-col gap-2">
                  <Row icon="✈" label="Flight" value={o.airline} />
                  <Row icon="⌂" label="Stay" value={o.hotel} />
                  <Row icon="♪" label="Do" value={o.activity} />
                </div>
                <Separator className="mt-auto bg-line" />
                <div className="flex items-center justify-between pt-[13px]">
                  <div>
                    <div className="text-[11px] font-bold text-ink-soft">
                      Departs in {o.departsIn} days · {o.seats} seats left
                    </div>
                    <div className="flex items-baseline gap-[7px]">
                      <span className="text-xs text-ink-soft line-through">
                        {fmt(b)}
                      </span>
                      <span className="font-display text-[21px] font-extrabold text-ink">
                        {fmt(from)}
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
        Prices shown are &quot;from&quot; estimates.
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
