import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Waits for CSS animations to finish before auditing.
 *
 * Measuring mid-fade blends foreground against backdrop and reports contrast
 * failures that do not exist at rest.
 */
async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState === "finished")
  );
}

const audit = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

const describe = (violations: Awaited<ReturnType<typeof audit>>["violations"]) =>
  violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} (${v.impact}) at ${n.target} — ${n.failureSummary?.replace(/\s+/g, " ")}`)
  );

test("banner has no accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.locator(".ccb-banner").waitFor();
  await settled(page);

  const { violations } = await audit(page);
  expect(describe(violations)).toEqual([]);
});

test("preferences modal has no accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Preferences" }).click();
  await page.getByRole("dialog").waitFor();
  await settled(page);

  const { violations } = await audit(page);
  expect(describe(violations)).toEqual([]);
});

/**
 * Regression: button text was hardcoded white, so a light accent produced
 * buttons below the WCAG AA 4.5:1 minimum with no way to correct it.
 */
test("primary buttons stay readable on a light accent", async ({ page }) => {
  await page.goto("/");
  await page.locator(".ccb-banner").waitFor();
  await settled(page);

  const { violations } = await audit(page);
  const contrastIssues = violations.filter((v) => v.id === "color-contrast");
  expect(describe(contrastIssues)).toEqual([]);
});
