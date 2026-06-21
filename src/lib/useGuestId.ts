"use client";

import { useEffect, useState } from "react";
import { GUEST_COOKIE } from "@/lib/constants";

/**
 * Reads the pp_guest token the middleware set. Falls back to minting one
 * client-side if it's missing (e.g. a route the matcher skipped), so a guest
 * always has a stable id to key draft trips by within this browser.
 */
export function useGuestId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${GUEST_COOKIE}=([^;]+)`)
    );
    if (match) {
      setId(decodeURIComponent(match[1]));
      return;
    }
    const minted = crypto.randomUUID();
    document.cookie = `${GUEST_COOKIE}=${minted};path=/;max-age=${
      60 * 60 * 24 * 365
    };samesite=lax`;
    setId(minted);
  }, []);

  return id;
}
