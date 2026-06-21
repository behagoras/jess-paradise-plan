import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load the same env the app uses (Clerk keys, Convex URL, optional E2E creds).
dotenv.config({ path: ".env.local" });

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // 1. Initialize Clerk's testing token (bypasses bot detection).
    { name: "setup", testMatch: /global\.setup\.ts/ },
    // 2. Run the specs with that setup as a dependency.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
