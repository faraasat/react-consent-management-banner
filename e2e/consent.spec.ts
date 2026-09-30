import { test, expect } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectNoClippedText,
  failOnConsoleErrors,
} from "./_helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("banner appears on a first visit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Cookie consent" })).toBeVisible();
});

test("page does not scroll sideways with the banner up", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ccb-banner")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

/**
 * Regression: the bar layout never set `flex-wrap`, so the links row could not
 * take its own line and the copy was crushed into a narrow column.
 */
test("bar layout gives the copy its own line above 880px", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "bar layout is desktop-only");

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const text = page.locator(".ccb-banner__text");
  const links = page.locator(".ccb-banner__links");
  await expect(text).toBeVisible();

  const textBox = (await text.boundingBox())!;
  const linksBox = (await links.boundingBox())!;

  // The links row must sit below the copy, not beside it.
  expect(linksBox.y).toBeGreaterThan(textBox.y + textBox.height - 1);

  // And the copy must get a genuine share of the width, not a squeezed column.
  expect(textBox.width).toBeGreaterThan(300);
});

test("no text is clipped in the banner", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ccb-banner")).toBeVisible();
  await expectNoClippedText(page, ".ccb-banner__text, .ccb-btn");
});

test("collapses to a bottom sheet on a phone", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "sheet behaviour is mobile-only");

  await page.goto("/");
  const banner = page.locator(".ccb-banner");
  await expect(banner).toBeVisible();

  const box = (await banner.boundingBox())!;
  const width = page.viewportSize()!.width;

  // Full-bleed, and anchored to the bottom of the viewport.
  expect(box.width).toBeGreaterThanOrEqual(width - 1);
  expect(await banner.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).not.toBe("0px");
  expect(await banner.evaluate((el) => getComputedStyle(el).borderBottomLeftRadius)).toBe("0px");
});

test("accepting all grants every category and persists it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Accept All" }).click();

  await expect(page.getByRole("region", { name: "Cookie consent" })).toBeHidden();

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cookiePreferences") || "null")
  );
  expect(stored.preferences.analytics_storage).toBe(true);
  expect(stored.version).toBeGreaterThanOrEqual(1);
  expect(stored.timestamp).toBeGreaterThan(0);
});

test("consent mode goes denied-by-default then updates", async ({ page }) => {
  await page.goto("/");

  // Polled rather than read once: the default consent state is set during
  // hydration, so a single immediate read races page load.
  await expect
    .poll(async () =>
      page.evaluate(() =>
        (window.dataLayer || [])
          .filter((a: IArguments) => a[0] === "consent")
          .map((a: IArguments) => a[1])
      )
    )
    .toContain("default");

  await page.getByRole("button", { name: "Accept All" }).click();

  await expect
    .poll(async () =>
      page.evaluate(() =>
        (window.dataLayer || [])
          .filter((a: IArguments) => a[0] === "consent")
          .map((a: IArguments) => a[1])
      )
    )
    .toContain("update");
});

test("preferences modal traps focus and closes on Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Preferences" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  // Focus starts inside the dialog.
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  // Background scrolling is locked.
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("always-on categories cannot be switched off", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Preferences" }).click();

  const necessary = page.getByRole("checkbox", { name: /Necessary/ });
  await expect(necessary).toBeDisabled();
  await expect(necessary).toBeChecked();
});

test("the demo page logs no errors", async ({ page }) => {
  const assertClean = failOnConsoleErrors(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Accept All" }).click();
  await page.waitForTimeout(400);
  assertClean();
});
