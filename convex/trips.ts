import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Persist a handed-off trip for the signed-in user. */
export const save = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("trips", { userId: identity.subject, ...args });
  },
});

/** List the signed-in user's saved trips, newest first. */
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
