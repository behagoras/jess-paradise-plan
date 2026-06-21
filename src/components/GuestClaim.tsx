"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGuestId } from "@/lib/useGuestId";

/**
 * On the transition to authenticated, migrate this browser's guest drafts to
 * the signed-in user (once). Renders nothing. Mounted under the Convex+Clerk
 * providers so useConvexAuth reflects a verified token before claiming.
 */
export function GuestClaim() {
  const { isAuthenticated } = useConvexAuth();
  const guestId = useGuestId();
  const claim = useMutation(api.trips.claimGuestTrips);
  const claimed = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !guestId || claimed.current) return;
    claimed.current = true;
    claim({ guestId }).catch(() => {
      claimed.current = false; // allow a retry if the call failed
    });
  }, [isAuthenticated, guestId, claim]);

  return null;
}
