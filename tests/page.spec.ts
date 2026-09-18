import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Reduced motion keeps the arriving-card animation from being caught mid-fade, which
// would make both the visibility and the contrast checks flaky.
test.use({ reducedMotion: "reduce" });

// The page asks Tockify which NextGen event is on. Never let the suite depend on the live
// calendar: by default Tockify answers "nothing on"; tests that need an event override it.
const TOCKIFY = "https://tockify.com/api/ngevent**";
test.beforeEach(async ({ page }) => {
  await page.route(TOCKIFY, (route) => route.fulfill({ json: { events: [] } }));
});

function tockifyEvent(title: string, startMs: number, endMs: number) {
  return {
    when: { start: { millis: startMs, offset: -7 * 3600_000 }, end: { millis: endMs } },
    content: { summary: { text: title } },
    status: { name: "scheduled" },
  };
}

const TRACKED = ["signup", "donate", "owls"];

test("every link is on screen and the sign-up comes first", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("a.card");
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toHaveAttribute("data-link", "signup");
  await expect(cards.first()).toBeInViewport();
  for (const id of ["instagram", "facebook", "youtube"]) {
    await expect(page.locator(`a[data-link="${id}"]`)).toBeVisible();
  }
});

test("the sign-up and donate buttons are above the fold", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[data-link="signup"]')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('a[data-link="donate"]')).toBeInViewport({ ratio: 1 });
});

test("sign-up and donate titles and subtitles each fit on one line", async ({ page }) => {
  await page.goto("/");
  for (const id of ["signup", "donate"]) {
    const lines = await page.locator(`a[data-link="${id}"] span.min-w-0 > span`).evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))),
    );
    expect(lines, id).toEqual([1, 1]);
  }
});

test("the socials are on the first screen too", async ({ page }) => {
  await page.goto("/");
  for (const id of ["instagram", "facebook", "youtube"]) {
    await expect(page.locator(`a[data-link="${id}"]`)).toBeInViewport({ ratio: 1 });
  }
});

test("the whole page fits on one screen", async ({ page }) => {
  await page.goto("/");
  const [height, viewport] = await page.evaluate(() => [document.documentElement.scrollHeight, innerHeight]);
  expect(height).toBeLessThanOrEqual(viewport);
});

test("the page fills the screen instead of leaving an empty band", async ({ page }) => {
  await page.goto("/");
  const gap = await page.evaluate(() => {
    const row = document.getElementById("share-open")!.getBoundingClientRect();
    const footer = document.querySelector("footer")!.getBoundingClientRect();
    return footer.top - row.bottom;
  });
  expect(gap).toBeLessThanOrEqual(48);
});

test.describe("header sky", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the birds crossing the header never overlap", async ({ page }) => {
    await page.goto("/");
    const overlaps = await page.evaluate(() => {
      const birds = [...document.querySelectorAll<HTMLElement>("header .glide")];
      const anims = document.getAnimations().filter((a) => (a as CSSAnimation).animationName === "glide");
      anims.forEach((a) => a.pause());
      const duration = Number(anims[0].effect!.getTiming().duration);
      const found: string[] = [];
      // Step through a whole cycle, a second at a time.
      for (let t = 0; t < duration; t += 1000) {
        // currentTime is shared; each bird's own (negative) delay already offsets it.
        anims.forEach((a) => (a.currentTime = t));
        const boxes = birds.map((b) => b.getBoundingClientRect());
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const [a, b] = [boxes[i], boxes[j]];
            if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) found.push(`${i}&${j} at ${t / 1000}s`);
          }
      }
      return found;
    });
    expect(overlaps).toEqual([]);
  });
});

test("no horizontal scrolling at phone width", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("tracked links carry the default referral tag", async ({ page }) => {
  await page.goto("/");
  for (const id of TRACKED) {
    const href = await page.locator(`a[data-link="${id}"]`).getAttribute("href");
    const url = new URL(href!);
    expect(url.searchParams.get("ms")).toBe("nextgen_linktree");
    expect(url.searchParams.get("utm_campaign")).toBe("nextgen_event");
    expect(url.searchParams.get("utm_medium")).toBe("qr");
  }
  // The calendar is our own site, not an EveryAction form: left untagged.
  const cal = await page.locator('a[data-link="calendar"]').getAttribute("href");
  expect(cal).not.toContain("ms=");
});

test("?src= is carried into the tracked links", async ({ page }) => {
  await page.goto("/?src=Discovery Park");
  const href = await page.locator('a[data-link="donate"]').getAttribute("href");
  const url = new URL(href!);
  expect(url.pathname).toBe("/donate/");
  expect(url.searchParams.get("ms")).toBe("nextgen_linktree_discovery_park");
  expect(url.searchParams.get("utm_campaign")).toBe("discovery_park");
});

test("a NextGen event on right now is carried into the tracked links", async ({ page }) => {
  const now = Date.now();
  await page.route(TOCKIFY, (route) =>
    route.fulfill({
      json: {
        events: [
          tockifyEvent("Neighborhood Bird Outing: Carkeek Park Scope and Sip (All ages welcome!)", now - 30 * 60_000, now + 90 * 60_000),
          tockifyEvent("Tomorrow's trivia", now + 24 * 3600_000, now + 26 * 3600_000),
        ],
      },
    }),
  );
  await page.goto("/");
  const donate = page.locator('a[data-link="donate"]');
  await expect(donate).toHaveAttribute("href", /utm_campaign=\d{4}_\d{2}_\d{2}_carkeek_park_scope_and_sip/);
  const url = new URL((await donate.getAttribute("href"))!);
  expect(url.searchParams.get("ms")).toMatch(/^nextgen_linktree_\d{4}_\d{2}_\d{2}_carkeek_park_scope_and_sip$/);
});

test("?src= wins over the calendar", async ({ page }) => {
  const now = Date.now();
  await page.route(TOCKIFY, (route) => route.fulfill({ json: { events: [tockifyEvent("Some walk", now - 60_000, now + 60_000)] } }));
  await page.goto("/?src=magnuson");
  await page.waitForTimeout(300);
  const url = new URL((await page.locator('a[data-link="donate"]').getAttribute("href"))!);
  expect(url.searchParams.get("utm_campaign")).toBe("magnuson");
});

test("if the calendar is unreachable, the default tags stay", async ({ page }) => {
  await page.route(TOCKIFY, (route) => route.abort());
  await page.goto("/");
  await page.waitForTimeout(300);
  const url = new URL((await page.locator('a[data-link="donate"]').getAttribute("href"))!);
  expect(url.searchParams.get("utm_campaign")).toBe("nextgen_event");
});

test("the share sheet draws a QR code for this page", async ({ page }) => {
  await page.goto("/?src=magnuson");
  await page.getByRole("button", { name: /Share via QR code/ }).click();
  const sheet = page.locator("#share-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("img", { name: /QR code for .*src=magnuson/ })).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toBeHidden();
});

test("no axe accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test("no axe violations with the share sheet open", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Share via QR code/ }).click();
  await expect(page.locator("#share-qr svg")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test("credits page lists every bird with its artist and licence", async ({ page }) => {
  await page.goto("/credits/");
  const rows = page.locator("main li");
  expect(await rows.count()).toBeGreaterThanOrEqual(5);
  for (const row of await rows.all()) {
    await expect(row).toContainText(/by .+ · /);
  }
  await expect(page.getByText("Great Blue Heron").first()).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
