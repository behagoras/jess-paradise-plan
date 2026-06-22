import { LogoMark, PlaneGlyph } from "./Logo";

/**
 * Honest descriptors shown at the foot of the rail. Decorative, desktop-only.
 * These describe the actual prototype rather than inventing usage metrics,
 * ratings, or savings — every value here is a literal fact about the app
 * (6-destination catalog, top-3 results, cached "from" prices).
 */
const STATS: [string, string][] = [
  ["6", "curated destinations"],
  ["3", "results per search"],
  ["~", "cached 'from' prices"],
];

/**
 * Persistent desktop brand panel (lg+ only). Fills the left half of the
 * viewport with the Paradise sunset scene so the otherwise-empty desktop
 * width becomes designed atmosphere rather than a beige void. Purely
 * presentational — carries no app state and never affects the wizard flow.
 */
export function BrandRail({ className = "" }: { className?: string }) {
  return (
    <aside className={"relative isolate overflow-hidden " + className}>
      {/* Scenic sunset base — coral → gold → teal, the brand hero scaled up. */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          background:
            "linear-gradient(158deg,#F0542D 0%,#F0876B 24%,#F2B25A 52%,#36B6BE 100%)",
        }}
      />
      {/* Warm sun glow, top-left. */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(120% 80% at 26% 12%,rgba(255,243,214,.92),rgba(255,243,214,0) 46%)",
        }}
      />
      {/* Cooler depth, bottom-right. */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(120% 70% at 84% 110%,rgba(16,72,84,.55),transparent 56%)",
        }}
      />
      {/* Grounding vignette so the footer text stays legible. */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-2/5"
        style={{
          background: "linear-gradient(to top,rgba(20,12,6,.34),transparent)",
        }}
      />
      {/* Film grain. */}
      <div className="pp-grain absolute inset-0 -z-10 opacity-[.14] mix-blend-overlay" />
      {/* A plane drifting across, far away. */}
      <div className="pp-drift absolute left-0 top-[20%] -z-10">
        <PlaneGlyph size={24} fill="rgba(255,255,255,.85)" />
      </div>
      <PalmSilhouette />

      {/* Foreground content. */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
        {/* Frosted logo lockup. */}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-lg shadow-black/10 backdrop-blur">
            <LogoMark size={30} />
          </span>
          <div className="font-display leading-[0.84]">
            <div className="text-[19px] font-extrabold tracking-[.01em]">
              PARADISE
            </div>
            <div className="text-[19px] font-extrabold tracking-[.2em]">
              PLAN
            </div>
          </div>
        </div>

        {/* Hero pitch. */}
        <div className="max-w-[440px]">
          {/* Honest tagline — no fake live "trips matched" counter or pulse. */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-bold tracking-[.01em] ring-1 ring-white/25 backdrop-blur">
            Surprise trips, tuned to your vibe
          </div>
          <h1 className="font-display text-[44px] font-extrabold leading-[0.98] tracking-[-.02em] [text-shadow:0_4px_30px_rgba(20,12,6,.35)] xl:text-[56px]">
            Don&apos;t pick where.
            <br />
            Pick the feeling.
          </h1>
          <p className="mt-5 max-w-[380px] text-[16px] leading-[1.5] text-white/90 [text-shadow:0_2px_14px_rgba(20,12,6,.4)]">
            Tell us your budget and your vibe. We hand you a trip, ready to
            book — no endless tabs, no decision fatigue.
          </p>
        </div>

        {/* Trust stats. */}
        <div className="flex flex-wrap gap-x-9 gap-y-4">
          {STATS.map(([big, small]) => (
            <div key={small}>
              <div className="font-display text-[26px] font-extrabold leading-none [text-shadow:0_2px_12px_rgba(20,12,6,.3)]">
                {big}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[.1em] text-white/75">
                {small}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/** Faint coconut-palm silhouette in the bottom-right corner for depth. */
function PalmSilhouette() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 200"
      className="pointer-events-none absolute -bottom-2 right-6 -z-10 h-[230px] w-auto opacity-[.32]"
      fill="none"
      stroke="rgba(20,12,6,.9)"
      strokeLinecap="round"
    >
      {/* trunk */}
      <path d="M86 200 C 78 150 74 116 92 86" strokeWidth="8" />
      {/* fronds radiating from the crown (~92,86) */}
      <path d="M92 86 C 60 70 36 72 18 86" strokeWidth="6" />
      <path d="M92 86 C 66 56 66 38 60 20" strokeWidth="6" />
      <path d="M92 86 C 118 60 140 60 156 74" strokeWidth="6" />
      <path d="M92 86 C 112 52 132 44 148 30" strokeWidth="6" />
      <path d="M92 86 C 90 56 96 40 104 24" strokeWidth="6" />
    </svg>
  );
}
