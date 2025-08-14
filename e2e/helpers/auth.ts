import type { Page } from "@playwright/test";

export async function login(page: Page) {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("Set E2E_EMAIL and E2E_PASSWORD in your environment to run auth E2E tests.");
  }

  await page.goto("/login");

  await page.getByLabel("Adres email").fill(email);
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj się", exact: true }).click();

  // Redirect to dashboard/home
  await page.waitForLoadState("networkidle");
}
