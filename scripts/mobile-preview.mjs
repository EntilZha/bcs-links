// Opens the dev server in a real, visible WebKit window emulating an iPhone 13 — Safari's
// engine, touch events, 390×844 CSS pixels at 3× — the way most walk participants see it.
// Pass a device name to try another phone: `pixi run mobile -- "Pixel 7"`.
import { chromium, devices, webkit } from "@playwright/test";

const name = process.argv[2] ?? "iPhone 13";
const device = devices[name];
if (!device) {
  console.error(`Unknown device "${name}". Try "iPhone 13", "iPhone SE", "Pixel 7".`);
  process.exit(1);
}
const engine = device.defaultBrowserType === "chromium" ? chromium : webkit;
const browser = await engine.launch({ headless: false });
const page = await (await browser.newContext(device)).newPage();
await page.goto(process.env.URL ?? "http://localhost:4321/");
page.on("close", () => browser.close());
browser.on("disconnected", () => process.exit(0));
