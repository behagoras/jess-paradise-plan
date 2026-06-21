import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

const USER = process.env.E2E_CLERK_USER_USERNAME;
const PASS = process.env.E2E_CLERK_USER_PASSWORD;

/** Drive the planner from the landing screen to the open hand-off sheet. */
async function planToHandoff(page: Page) {
  await expect(page.locator('[data-screen-label="Landing"]')).toBeVisible();

  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page.locator('[data-screen-label="Preferences"]')).toBeVisible();

  // Step 1 → Step 2 (defaults are pre-selected; the wizard is now 2 steps).
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Preferences")).toBeVisible();

  // Generate → results (the loader runs ~2.9s).
  await page.getByRole("button", { name: "Surprise me" }).click();
  await expect(page.locator('[data-screen-label="Results"]')).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "Select" }).first().click();
  await expect(
    page.locator('[data-screen-label="Package detail"]')
  ).toBeVisible();

  await page.getByRole("button", { name: /Reserve with/ }).click();
  await expect(page.locator('[data-screen-label="Hand-off"]')).toBeVisible();
}

test.describe("Paradise Plan — guest flow", () => {
  test("plans a trip end-to-end and reaches the hand-off sheet", async ({
    page,
  }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/");
    await planToHandoff(page);

    // The hand-off CTA is shown to everyone (no login gate), matching the design.
    await expect(
      page.getByRole("button", { name: /Continue to Expedia/ })
    ).toBeVisible();
  });

  test("traveler stepper (in More filters) carries through to results", async ({
    page,
  }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/");
    await page.getByRole("button", { name: "Get started" }).click();

    // Travelers + budget now live in the optional, collapsed "More filters".
    await page.getByRole("button", { name: /More filters/ }).click();
    // Bump travelers 2 → 3 via the "+" stepper.
    await page.getByRole("button", { name: "+", exact: true }).click();

    // Step 1 → Step 2 → results, then open a package to see the travelers label.
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Surprise me" }).click();
    await expect(page.locator('[data-screen-label="Results"]')).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Select" }).first().click();

    await expect(page.getByText("3 travelers")).toBeVisible();
  });
});

test.describe("Paradise Plan — authenticated flow", () => {
  test.skip(
    !USER || !PASS,
    "Set E2E_CLERK_USER_USERNAME and E2E_CLERK_USER_PASSWORD in .env.local to run"
  );

  test("signs in, then confirms the hand-off (saves to Convex)", async ({
    page,
  }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/");

    // Open the modal sign-in from the in-frame "Sign in" pill on the landing.
    await page
      .getByRole("button", { name: "Sign in", exact: true })
      .first()
      .click();

    const dialog = page.getByRole("dialog");
    await dialog.locator('input[name="identifier"]').fill(USER!);
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();
    await dialog.locator('input[name="password"]').fill(PASS!);
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();

    // Signed in → the Clerk UserButton avatar appears in the header.
    await expect(page.locator(".cl-userButtonTrigger")).toBeVisible({
      timeout: 20_000,
    });

    await planToHandoff(page);

    // An authenticated user gets the real "Continue to Expedia" CTA.
    const confirm = page.getByRole("button", { name: /Continue to Expedia/ });
    await expect(confirm).toBeVisible();
    await confirm.click();

    // After saving, the sheet closes back to the package detail.
    await expect(
      page.locator('[data-screen-label="Package detail"]')
    ).toBeVisible({ timeout: 15_000 });
  });
});
