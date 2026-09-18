import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against a production build on port 4322, never the dev server, and never reuses a
 * server — the same two lessons bcs-birdweb learned the hard way (a reused server meant
 * the suite tested the previous build). See that repo's playwright.config.ts.
 *
 * Phones only: nearly everyone arrives from a QR code, so an iPhone (WebKit) and an
 * Android phone (Chromium) are the two browsers that matter.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: { baseURL: "http://localhost:4322" },
  projects: [
    { name: "iphone", use: { ...devices["iPhone 13"] } },
    { name: "iphone17", use: { ...devices["iPhone 17"] } },
    { name: "pixel", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4322",
    url: "http://localhost:4322/",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
