import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });

// Obtains a Clerk Testing Token so the bot-detection / device checks don't
// block automated sign-in. Reads the keys explicitly from the app's env names.
setup("global setup", async () => {
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
});
