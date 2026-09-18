import { defineConfig } from "vitest/config";

// Only src/lib is covered: the pure functions (referral tagging, bird of the day) that
// are worth testing without a browser in the way.
export default defineConfig({
  test: {
    globals: true,
    include: ["src/lib/**/*.test.ts"],
  },
});
