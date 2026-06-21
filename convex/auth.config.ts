/**
 * Convex ↔ Clerk auth bridge. The domain is the Clerk Frontend API URL
 * (Issuer) used to verify JWTs minted by Clerk's "convex" template.
 * Set NEXT_PUBLIC_CLERK_FRONTEND_API_URL in your Convex deployment env.
 */
export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};
