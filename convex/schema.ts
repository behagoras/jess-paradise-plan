import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A trip the user chose to hand off / book.
  //
  // While the visitor is a guest it carries `guestId` (the pp_guest cookie
  // token) and no `userId`. On sign-in, `claimGuestTrips` reassigns the row to
  // the Clerk subject: it sets `userId` and clears `guestId`. So at any moment
  // exactly one of the two identifiers is set.
  trips: defineTable({
    userId: v.optional(v.string()), // Clerk subject, set once claimed/saved authed
    guestId: v.optional(v.string()), // pp_guest cookie token, set for guest drafts
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
  })
    .index("by_user", ["userId"])
    .index("by_guest", ["guestId"]),
});
