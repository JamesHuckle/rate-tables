import { expect, test } from "@playwright/test";

test("capture desktop surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Make every rate traceable." })).toBeVisible();
  await page.screenshot({ path: "screenshots/desktop-empty.png", fullPage: true });
  await page.getByRole("button", { name: /Open the worked example/ }).click();
  await expect(page.getByRole("heading", { name: "Review the model" })).toBeVisible();
  await page.getByRole("button", { name: "Select", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "screenshots/desktop-workspace.png", fullPage: true });
});

test("capture mobile surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "screenshots/mobile-empty.png", fullPage: true });
  await page.getByRole("button", { name: /Open the worked example/ }).click();
  await page.getByRole("button", { name: "Select", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "screenshots/mobile-workspace.png", fullPage: true });
});
