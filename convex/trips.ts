import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Shared trip payload (everything except the owner identifiers).
const tripFields = {
  destinationKey: v.string(),
  destinationName: v.string(),
  region: v.string(),
  provider: v.string(),
  travelers: v.number(),
  total: v.number(),
  perPerson: v.number(),
  when: v.string(),
  departure: v.string(),
  activityOn: v.boolean(),
};

/** Persist a handed-off trip for the signed-in user. */
export const save = mutation({
  args: tripFields,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("trips", { userId: identity.subject, ...args });
  },
});

/**
 * Persist a guest's draft keyed by the pp_guest cookie token. No auth required.
 * Upserts: one live draft per guest (the current session's selections).
 * The token is an unguessable capability — treat draft visibility accordingly.
 */
export const saveDraft = mutation({
  args: { guestId: v.string(), ...tripFields },
  handler: async (ctx, { guestId, ...trip }) => {
    const existing = await ctx.db
      .query("trips")
      .withIndex("by_guest", (q) => q.eq("guestId", guestId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, trip);
      return existing._id;
    }
    return await ctx.db.insert("trips", { guestId, ...trip });
  },
});

/**
 * Migrate any guest drafts to the now signed-in user. Called once right after
 * sign-in. Reassigns ownership: sets userId, clears guestId.
 */
export const claimGuestTrips = mutation({
  args: { guestId: v.string() },
  handler: async (ctx, { guestId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const drafts = await ctx.db
      .query("trips")
      .withIndex("by_guest", (q) => q.eq("guestId", guestId))
      .collect();
    for (const d of drafts) {
      await ctx.db.patch(d._id, { userId: identity.subject, guestId: undefined });
    }
    return drafts.length;
  },
});

/** List the signed-in user's trips, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("trips")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});
