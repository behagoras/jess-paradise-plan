import { internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Currency conversion to MXN, with a REAL cached exchange rate.
 *
 * The whole app prices in MXN: every provider (Travelpayouts, LiteAPI, Viator)
 * is asked for MXN natively. But a provider can still return a non-MXN price
 * (some inventory is only quoted in USD). When that happens we do NOT omit the
 * price (a currency mismatch is not "missing data"): we CONVERT it to MXN with
 * a real exchange rate fetched from a free, no-key source, cached ~24h.
 *
 * NON-NEGOTIABLE HONESTY (mirrors convex/travelpayouts.ts): we NEVER fabricate
 * the FX rate. If the rate fetch fails, `toMxn` returns null and the caller
 * keeps the original amount + currency, labelled honestly, rather than inventing
 * a conversion. Converted amounts are rounded to whole pesos.
 *
 * Source: https://open.er-api.com/v6/latest/USD (free, no key, ~daily rates).
 */

// Free, no-key FX source. Returns { result, base_code, rates: { CODE: rate } }
// where each rate is "units of CODE per 1 unit of base_code".
const FX_API = "https://open.er-api.com/v6/latest/";

// Rates barely move intraday; a 24h TTL keeps us off the source's rate limit.
const FX_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Cache helpers (actions reach the db through these internal fns)
// ---------------------------------------------------------------------------

export const _fxCacheGet = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db
      .query("tpFxCache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return row ? { rates: row.rates, fetchedAt: row.fetchedAt } : null;
  },
});

export const _fxCacheSet = internalMutation({
  args: { key: v.string(), rates: v.any() },
  handler: async (ctx, { key, rates }) => {
    const existing = await ctx.db
      .query("tpFxCache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    const doc = { key, rates, fetchedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("tpFxCache", doc);
  },
});

/**
 * Read-through cache of the rate table for one base currency. Returns a
 * { CODE -> units per 1 base } map, or null if the source could not be reached
 * (never a fabricated table).
 */
async function getRates(
  ctx: { runQuery: any; runMutation: any },
  base: string
): Promise<Record<string, number> | null> {
  const key = base.toUpperCase();
  const cached = await ctx.runQuery(internal.fx._fxCacheGet, { key });
  if (cached && Date.now() - cached.fetchedAt < FX_TTL_MS) {
    return cached.rates as Record<string, number>;
  }
  try {
    const res = await fetch(`${FX_API}${key}`);
    if (!res.ok) return cached ? (cached.rates as Record<string, number>) : null;
    const body = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (body.result !== "success" || !body.rates) {
      return cached ? (cached.rates as Record<string, number>) : null;
    }
    await ctx.runMutation(internal.fx._fxCacheSet, { key, rates: body.rates });
    return body.rates;
  } catch {
    // Network failure: fall back to a stale cached table if we have one, else
    // null. We NEVER invent a rate.
    return cached ? (cached.rates as Record<string, number>) : null;
  }
}

/**
 * Convert `amount` from `fromCurrency` into MXN using a real cached rate.
 * Returns the amount rounded to whole pesos, or null if no real rate is
 * available (caller then keeps the original amount + currency, honestly
 * labelled - we never fabricate the rate). Already-MXN input passes through.
 */
export async function toMxn(
  ctx: { runQuery: any; runMutation: any },
  amount: number,
  fromCurrency: string
): Promise<number | null> {
  const from = (fromCurrency || "").toUpperCase();
  if (from === "MXN") return Math.round(amount);
  if (!from) return null;

  // Pull the rate table for the source currency; rates[MXN] is "MXN per 1 unit
  // of `from`", which is exactly the multiplier we need.
  const rates = await getRates(ctx, from);
  const rate = rates?.["MXN"];
  if (typeof rate !== "number" || !(rate > 0)) return null;
  return Math.round(amount * rate);
}
