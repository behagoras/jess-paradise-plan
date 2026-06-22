"use client";

import { useState } from "react";
import {
  CITIES,
  WHEN,
  PACKAGES,
  VACATION,
  TRAVELER_TYPES,
  GENERAL,
  WEATHER,
} from "@/lib/data";
import { TRIP_LENGTHS } from "@/lib/scoring";
import { Chip } from "@/components/ui/chip";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { fmt, WIZARD_STEPS, type PlannerApi } from "@/lib/usePlanner";
import { cn } from "@/lib/utils";

const fieldLabel =
  "mb-[11px] text-xs font-extrabold uppercase tracking-[.06em] text-ink-soft";

function ChipRow({
  items,
  isActive,
  onPick,
  accent2 = false,
}: {
  items: string[];
  isActive: (v: string) => boolean;
  onPick: (v: string) => void;
  accent2?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {items.map((v) => (
        <Chip
          key={v}
          active={isActive(v)}
          accent2={accent2}
          onClick={() => onPick(v)}
        >
          {v}
        </Chip>
      ))}
    </div>
  );
}

const h2 =
  "font-display m-0 mb-[3px] text-[25px] font-extrabold tracking-[-.01em]";
const sub = "m-0 mb-[22px] text-sm text-ink-soft";

const STEPS = Array.from({ length: WIZARD_STEPS }, (_, i) => i + 1);

export function Wizard({ planner }: { planner: PlannerApi }) {
  const { state, setState, toggleArr, goStep, prevStep } = planner;

  const tabClass = (n: number) => {
    const active = n === state.step;
    const done = n < state.step;
    return cn(
      "flex-1 cursor-pointer rounded-[11px] border-[1.5px] px-1 py-[9px] text-[12.5px] font-extrabold tracking-[.02em] transition-all duration-200",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : done
          ? "border-primary bg-card text-primary"
          : "border-line bg-card text-ink-soft",
    );
  };

  return (
    <div data-screen-label="Preferences" className="px-5 pt-1.5 pb-8 sm:px-7">
      <div className="flex items-center gap-3 py-[10px_0] pb-3.5 pt-2.5">
        <button
          onClick={prevStep}
          aria-label="Back"
          className="h-[38px] flex-none cursor-pointer rounded-[11px] border border-line bg-card px-3 text-lg text-ink"
        >
          ←
        </button>
        {STEPS.map((n) => (
          <button key={n} onClick={() => goStep(n)} className={tabClass(n)}>
            Step {n}
          </button>
        ))}
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-md bg-line">
        <div
          className="h-full rounded-md bg-primary transition-all duration-300"
          style={{ width: Math.round((state.step / WIZARD_STEPS) * 100) + "%" }}
        />
      </div>

      {/* STEP 1 — only the two fields that drive output stay visible; the rest
          collapse into an optional, default-closed "More filters" group. */}
      {state.step === 1 && (
        <div className="animate-pp-up">
          <h2 className={h2}>Your trip</h2>
          <p className={sub}>The basics. Flexibility unlocks the best prices.</p>

          <div className={fieldLabel}>When</div>
          <div className="mb-6">
            <ChipRow
              items={WHEN}
              isActive={(v) => state.when === v}
              onPick={(v) => setState((s) => ({ ...s, when: v }))}
            />
          </div>

          <div className="mb-[11px] flex items-center justify-between">
            <span className={cn(fieldLabel, "mb-0")}>Activity intensity</span>
            <span className="text-xs font-bold text-ink-soft">low → high</span>
          </div>
          <div className="mb-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setState((s) => ({ ...s, intensity: n }))}
                className={cn(
                  "font-display flex-1 cursor-pointer rounded-xl border-[1.5px] py-[13px] text-base font-extrabold transition-all duration-150",
                  n === state.intensity
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-line bg-card text-ink",
                )}
              >
                {n}
              </button>
            ))}
          </div>

          <MoreFilters planner={planner} />
        </div>
      )}

      {/* STEP 2 */}
      {state.step === 2 && (
        <div className="animate-pp-up">
          <h2 className={h2}>Preferences</h2>
          <p className={sub}>The feeling you&apos;re after. Select all that apply.</p>

          <div className="mb-3 text-xs font-extrabold uppercase tracking-[.08em] text-ink">
            General
          </div>
          <div className="mb-[26px]">
            <ChipRow
              items={GENERAL}
              isActive={(v) => state.general.includes(v)}
              onPick={(v) => toggleArr("general", v)}
            />
          </div>

          <div className="mb-3 text-xs font-extrabold uppercase tracking-[.08em] text-ink">
            Weather
          </div>
          <ChipRow
            items={WEATHER}
            isActive={(v) => state.weather.includes(v)}
            onPick={(v) => toggleArr("weather", v)}
            accent2
          />
        </div>
      )}
    </div>
  );
}

/**
 * Optional, default-closed disclosure. Most of these now drive real output:
 * budget + trip length filter the candidate destinations, departure sets the
 * real flight origin (Travelpayouts), travelers becomes the adult count, and the
 * "Include" packages decide which real lines (flight / hotel) are fetched and
 * priced. Vacation type and who's-traveling are still collected for future use
 * but don't yet affect results — honest no-ops, not faked output.
 */
function MoreFilters({ planner }: { planner: PlannerApi }) {
  const { state, setState, toggleArr } = planner;
  const [open, setOpen] = useState(false);

  const activeLength =
    TRIP_LENGTHS.find(
      (t) => t.min === state.daysMin && t.max === state.daysMax,
    ) ?? TRIP_LENGTHS[0];

  return (
    <div className="mt-[22px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[14px] border-[1.5px] border-line bg-card px-4 py-3 text-left"
      >
        <span className="text-sm font-extrabold text-ink">
          More filters{" "}
          <span className="font-bold text-ink-soft">· optional</span>
        </span>
        <span
          className="text-[13px] text-ink-soft transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="animate-pp-up mt-4"
          aria-label="Optional filters"
        >
          <div className={fieldLabel}>Trip length</div>
          <div className="mb-6">
            <ChipRow
              items={TRIP_LENGTHS.map((t) => t.label)}
              isActive={(v) => v === activeLength.label}
              onPick={(v) => {
                const t = TRIP_LENGTHS.find((x) => x.label === v);
                if (t) setState((s) => ({ ...s, daysMin: t.min, daysMax: t.max }));
              }}
            />
          </div>

          <div className="mb-3.5 flex items-baseline justify-between">
            <span className={cn(fieldLabel, "mb-0")}>Budget per person</span>
            <span className="font-display text-[22px] font-extrabold text-primary">
              {fmt(state.budget)}
            </span>
          </div>
          <Slider
            min={8000}
            max={120000}
            step={1000}
            value={[state.budget]}
            onValueChange={(v) =>
              setState((s) => ({ ...s, budget: v[0] ?? s.budget }))
            }
            className="py-2.5"
          />
          <div className="mb-[26px] mt-1 flex justify-between text-xs font-semibold text-ink-soft">
            <span>{fmt(8000)}</span>
            <span>{fmt(120000)}+</span>
          </div>

          <div className="mb-[11px] flex items-center justify-between">
            <span className={cn(fieldLabel, "mb-0")}>Travelers</span>
            <div className="flex items-center gap-4">
              <button
                aria-label="−"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    travelers: Math.max(1, s.travelers - 1),
                  }))
                }
                className="h-[38px] w-[38px] cursor-pointer rounded-full border-[1.5px] border-line bg-card text-xl leading-none text-ink"
              >
                −
              </button>
              <span className="font-display min-w-6 text-center text-[22px] font-extrabold">
                {state.travelers}
              </span>
              <button
                aria-label="+"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    travelers: Math.min(9, s.travelers + 1),
                  }))
                }
                className="h-[38px] w-[38px] cursor-pointer rounded-full border-[1.5px] border-primary bg-primary text-xl leading-none text-primary-foreground"
              >
                +
              </button>
            </div>
          </div>

          <Separator className="my-[22px] bg-line" />

          {/* Departure sets the real Travelpayouts flight origin (CITY_TO_IATA). */}
          <div className={fieldLabel}>Departure point</div>
          <div className="mb-6">
            <ChipRow
              items={CITIES}
              isActive={(v) => state.departure === v}
              onPick={(v) => setState((s) => ({ ...s, departure: v }))}
            />
          </div>

          <div className={fieldLabel}>Include</div>
          <div className="mb-6">
            <ChipRow
              items={PACKAGES}
              isActive={(v) => state.packages.includes(v)}
              onPick={(v) => toggleArr("packages", v)}
            />
          </div>

          <div className={fieldLabel}>Vacation type</div>
          <div className="mb-6">
            <ChipRow
              items={VACATION}
              isActive={(v) => state.vacation.includes(v)}
              onPick={(v) => toggleArr("vacation", v)}
            />
          </div>

          <div className={fieldLabel}>Who&apos;s traveling</div>
          <div className="mb-2">
            <ChipRow
              items={TRAVELER_TYPES}
              isActive={(v) => state.travelerTypes.includes(v)}
              onPick={(v) => toggleArr("travelerTypes", v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
