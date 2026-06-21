import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A trip the user chose to hand off / book. Persisted on the Hand-off sheet.
  trips: defineTable({
    userId: v.string(), // Clerk subject (tokenIdentifier subject)
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
  }).index("by_user", ["userId"]),
});
