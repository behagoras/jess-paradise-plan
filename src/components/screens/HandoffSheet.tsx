"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fmt, type PlannerApi } from "@/lib/usePlanner";
import { useGuestId } from "@/lib/useGuestId";
import { PlaneGlyph } from "../Logo";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const AVIASALES = "https://www.aviasales.com";

export function HandoffSheet({ planner }: { planner: PlannerApi }) {
  const { computed, state, go } = planner;
  const { offer, provider, grand, perPerson, travelersLabel } = computed;
  const { isAuthenticated } = useConvexAuth();
  const guestId = useGuestId();
  const saveTrip = useMutation(api.trips.save);
  const saveDraft = useMutation(api.trips.saveDraft);
  const [saving, setSaving] = useState(false);

  const close = () => go("detail");

  // No real offer to hand off (empty/errored search) — bounce to results,
  // which renders the honest widen hint. Render nothing rather than a fake.
  useEffect(() => {
    if (!offer) go("results");
  }, [offer, go]);
  if (!offer) return null;

  const dest = offer.dest;

  const confirm = async () => {
    setSaving(true);
    const trip = {
      destinationKey: dest.key,
      destinationName: dest.name,
      region: dest.region,
      provider,
      travelers: state.travelers,
      total: Math.round(grand),
      perPerson: Math.round(perPerson),
      when: state.when,
      departure: state.departure,
      activityOn: false, // no live activity source yet — never persist a fake one
    };
    try {
      // Browsing history (NOT a booking): record what the visitor handed off
      // to the provider. Signed in → save under the user. Guest → save a draft
      // keyed by the pp_guest cookie token; GuestClaim migrates it on sign-in.
      if (isAuthenticated) await saveTrip(trip);
      else if (guestId) await saveDraft({ guestId, ...trip });
    } catch {
      // Soft-fail: the hand-off proceeds regardless of the history write.
    } finally {
      // Affiliate-only model: we never take payment — we deep-link out to the
      // provider so the user books there, with our marker for attribution. The
      // marker is the public Travelpayouts account id (safe to ship via
      // NEXT_PUBLIC); the API token for live data stays server-side in Convex.
      // Prefer the REAL flight deep link the API returned; fall back to a
      // Hotellook destination search for the real destination.
      const marker = process.env.NEXT_PUBLIC_TP_MARKER ?? "";
      const flightLink = offer.flight.link
        ? AVIASALES + offer.flight.link
        : null;
      const query = encodeURIComponent(
        [dest.name, dest.region].filter(Boolean).join(" ")
      );
      const fallback =
        `https://search.hotellook.com/?destination=${query}` +
        (marker ? `&marker=${marker}` : "");
      const affiliateDeepLink =
        flightLink && marker
          ? `${flightLink}${flightLink.includes("?") ? "&" : "?"}marker=${marker}`
          : (flightLink ?? fallback);
      window.open(affiliateDeepLink, "_blank", "noopener,noreferrer");
      setSaving(false);
      go("detail");
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        data-screen-label="Hand-off"
        className="mx-auto max-w-md gap-0 rounded-t-[30px] border-line bg-card px-6 pb-[calc(28px+env(safe-area-inset-bottom))] pt-[26px] text-center sm:max-w-lg"
      >
        <div className="mx-auto mb-[22px] h-[5px] w-11 rounded-md bg-line" />
        <div
          className="mx-auto mb-[18px] flex h-[74px] w-[74px] items-center justify-center rounded-[22px]"
          style={{
            background: "linear-gradient(135deg,var(--accent2),var(--accent))",
          }}
        >
          <PlaneGlyph size={40} fill="#fff" />
        </div>
        <SheetTitle className="font-display m-0 mb-2 text-[23px] font-extrabold tracking-[-.01em] text-ink">
          Off to {provider}
        </SheetTitle>
        <SheetDescription className="mx-auto mb-5 max-w-[300px] text-[14.5px] leading-[1.5] text-ink-soft">
          We hand you to {provider} to finish booking {dest.name}. Your
          selections carry over. The final price is confirmed on their site.
        </SheetDescription>
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-surface2 px-[17px] py-3.5">
          <span className="text-sm font-bold">
            {dest.name} · {travelersLabel}
          </span>
          <span className="font-display text-[19px] font-extrabold text-primary">
            {fmt(grand)}
          </span>
        </div>

        <Button
          onClick={confirm}
          disabled={saving}
          className="font-display mb-[11px] h-auto w-full rounded-2xl py-[17px] text-[17px] font-extrabold"
        >
          {saving ? "Saving…" : `Continue to ${provider} →`}
        </Button>

        <button
          onClick={close}
          className="w-full cursor-pointer border-none bg-transparent p-1.5 text-sm font-bold text-ink-soft"
        >
          Keep editing
        </button>
      </SheetContent>
    </Sheet>
  );
}
