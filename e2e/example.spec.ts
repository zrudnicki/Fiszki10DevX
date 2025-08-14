import { test, expect } from "@playwright/test";

test("homepage has title and dashboard loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Fiszki/i);
  await expect(page.locator("main")).toBeVisible();
});
