"use client";

import {
  CITIES,
  WHEN,
  PACKAGES,
  VACATION,
  TRAVELER_TYPES,
  GENERAL,
  WEATHER,
} from "@/lib/data";
import { chip, fieldLabel } from "@/lib/theme";
import { fmt, type PlannerApi } from "@/lib/usePlanner";

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
    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
      {items.map((v) => (
        <button key={v} onClick={() => onPick(v)} style={chip(isActive(v), accent2)}>
          {v}
        </button>
      ))}
    </div>
  );
}

const h2: React.CSSProperties = {
  fontFamily: "var(--fd)",
  fontWeight: 800,
  fontSize: 25,
  margin: "0 0 3px",
  letterSpacing: "-.01em",
};
const sub: React.CSSProperties = {
  color: "var(--ink-soft)",
  fontSize: 14,
  margin: "0 0 22px",
};

export function Wizard({ planner }: { planner: PlannerApi }) {
  const { state, setState, toggleArr, goStep, prevStep } = planner;

  const tabStyle = (n: number): React.CSSProperties => {
    const active = n === state.step;
    const done = n < state.step;
    return {
      flex: 1,
      padding: "9px 4px",
      borderRadius: 11,
      cursor: "pointer",
      fontFamily: "var(--fb)",
      fontWeight: 800,
      fontSize: 12.5,
      letterSpacing: ".02em",
      transition: "all .2s",
      border: `1.5px solid ${active || done ? "var(--accent)" : "var(--line)"}`,
      background: active ? "var(--accent)" : "var(--surface)",
      color: active ? "var(--accent-ink)" : done ? "var(--accent)" : "var(--ink-soft)",
    };
  };

  return (
    <div data-screen-label="Preferences" style={{ padding: "6px 22px 132px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 0 14px",
        }}
      >
        <button
          onClick={prevStep}
          style={{
            flex: "0 0 38px",
            height: 38,
            borderRadius: 11,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => goStep(n)} style={tabStyle(n)}>
            Step {n}
          </button>
        ))}
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 6,
          background: "var(--line)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 6,
            background: "var(--accent)",
            transition: "width .3s",
            width: Math.round((state.step / 3) * 100) + "%",
          }}
        />
      </div>

      {/* STEP 1 */}
      {state.step === 1 && (
        <div style={{ animation: "pp-up .35s ease both" }}>
          <h2 style={h2}>Your trip</h2>
          <p style={sub}>The basics. Flexibility unlocks the best prices.</p>

          <div style={fieldLabel}>Departure point</div>
          <div style={{ marginBottom: 24 }}>
            <ChipRow
              items={CITIES}
              isActive={(v) => state.departure === v}
              onPick={(v) => setState((s) => ({ ...s, departure: v }))}
            />
          </div>

          <div style={fieldLabel}>When</div>
          <div style={{ marginBottom: 24 }}>
            <ChipRow
              items={WHEN}
              isActive={(v) => state.when === v}
              onPick={(v) => setState((s) => ({ ...s, when: v }))}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 11,
            }}
          >
            <span style={{ ...fieldLabel, marginBottom: 0 }}>Travelers</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() =>
                  setState((s) => ({ ...s, travelers: Math.max(1, s.travelers - 1) }))
                }
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                −
              </button>
              <span
                style={{
                  fontFamily: "var(--fd)",
                  fontWeight: 800,
                  fontSize: 22,
                  minWidth: 24,
                  textAlign: "center",
                }}
              >
                {state.travelers}
              </span>
              <button
                onClick={() =>
                  setState((s) => ({ ...s, travelers: Math.min(9, s.travelers + 1) }))
                }
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1.5px solid var(--accent)",
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "18px 0 22px" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 14,
            }}
          >
            <span style={{ ...fieldLabel, marginBottom: 0 }}>Budget per person</span>
            <span
              style={{
                fontFamily: "var(--fd)",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--accent)",
              }}
            >
              {fmt(state.budget)}
            </span>
          </div>
          <input
            type="range"
            min={400}
            max={6000}
            step={100}
            value={state.budget}
            onChange={(e) =>
              setState((s) => ({ ...s, budget: +e.target.value }))
            }
            style={{ width: "100%", height: 30, cursor: "pointer" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--ink-soft)",
              fontWeight: 600,
              margin: "-2px 0 26px",
            }}
          >
            <span>$400</span>
            <span>$6,000+</span>
          </div>

          <div style={fieldLabel}>Include</div>
          <div style={{ marginBottom: 24 }}>
            <ChipRow
              items={PACKAGES}
              isActive={(v) => state.packages.includes(v)}
              onPick={(v) => toggleArr("packages", v)}
            />
          </div>

          <div style={fieldLabel}>Vacation type</div>
          <div style={{ marginBottom: 24 }}>
            <ChipRow
              items={VACATION}
              isActive={(v) => state.vacation.includes(v)}
              onPick={(v) => toggleArr("vacation", v)}
            />
          </div>

          <div style={fieldLabel}>Who&apos;s traveling</div>
          <div style={{ marginBottom: 24 }}>
            <ChipRow
              items={TRAVELER_TYPES}
              isActive={(v) => state.travelerTypes.includes(v)}
              onPick={(v) => toggleArr("travelerTypes", v)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 11,
            }}
          >
            <span style={{ ...fieldLabel, marginBottom: 0 }}>Activity intensity</span>
            <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700 }}>
              low → high
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setState((s) => ({ ...s, intensity: n }))}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: 12,
                  border: `1.5px solid ${
                    n === state.intensity ? "var(--accent)" : "var(--line)"
                  }`,
                  background:
                    n === state.intensity ? "var(--accent)" : "var(--surface)",
                  color:
                    n === state.intensity ? "var(--accent-ink)" : "var(--ink)",
                  fontFamily: "var(--fd)",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {state.step === 2 && (
        <div style={{ animation: "pp-up .35s ease both" }}>
          <h2 style={h2}>Preferences</h2>
          <p style={sub}>The feeling you&apos;re after. Select all that apply.</p>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--ink)",
              marginBottom: 12,
            }}
          >
            General
          </div>
          <div style={{ marginBottom: 26 }}>
            <ChipRow
              items={GENERAL}
              isActive={(v) => state.general.includes(v)}
              onPick={(v) => toggleArr("general", v)}
            />
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--ink)",
              marginBottom: 12,
            }}
          >
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

      {/* STEP 3 */}
      {state.step === 3 && <Step3Summary planner={planner} />}
    </div>
  );
}

function Step3Summary({ planner }: { planner: PlannerApi }) {
  const { state } = planner;
  const filters = state.general.concat(state.weather);
  const travelersLabel =
    state.travelers + (state.travelers === 1 ? " traveler" : " travelers");

  const rows = [
    { k: "Departure", v: state.departure },
    { k: "When", v: state.when },
    { k: "Travelers", v: travelersLabel },
    { k: "Budget", v: fmt(state.budget) + " / person" },
    { k: "Packages", v: state.packages.length ? state.packages.join(", ") : "Any" },
    { k: "Vacation type", v: state.vacation.length ? state.vacation.join(", ") : "Any" },
    {
      k: "Traveler type",
      v: state.travelerTypes.length ? state.travelerTypes.join(", ") : "Any",
    },
    { k: "Activity level", v: state.intensity + " / 5" },
    { k: "Filters", v: filters.length ? filters.join(", ") : "Any" },
  ];

  return (
    <div style={{ animation: "pp-up .35s ease both" }}>
      <h2 style={h2}>Selections summary</h2>
      <p style={sub}>Review, then let us surprise you.</p>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          padding: "6px 19px 10px",
        }}
      >
        {rows.map((r, i) => (
          <div
            key={r.k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              padding: "11px 0",
              borderBottom:
                i === rows.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <span
              style={{
                color: "var(--ink-soft)",
                fontWeight: 700,
                fontSize: 13.5,
                whiteSpace: "nowrap",
              }}
            >
              {r.k}
            </span>
            <span style={{ fontWeight: 700, textAlign: "right", fontSize: 14 }}>
              {r.v}
            </span>
          </div>
        ))}
      </div>
      <p
        style={{
          textAlign: "center",
          color: "var(--ink-soft)",
          fontSize: 12.5,
          margin: "16px 6px 0",
          lineHeight: 1.5,
        }}
      >
        Tap any step above to edit. We never charge you here. You book on the
        provider&apos;s site.
      </p>
    </div>
  );
}
