"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Paradise selectable "pill" chip — a controlled <button> reproducing the
 * source `chip(active, accent2)` helper. `accent2` swaps the orange selection
 * for the yellow accent (used by the Weather chips in the wizard step 2).
 *
 * Kept as a real <button> so e2e accessible-name selectors keep working.
 */
export function Chip({
  active,
  accent2 = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  active: boolean;
  accent2?: boolean;
}) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        "cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-4 py-[11px] text-sm font-bold transition-all duration-150",
        active
          ? accent2
            ? "border-accent2 bg-accent2 text-accent2-ink"
            : "border-primary bg-primary text-primary-foreground"
          : "border-line bg-card text-ink hover:border-ink-soft/40",
        className,
      )}
      {...props}
    />
  );
}
