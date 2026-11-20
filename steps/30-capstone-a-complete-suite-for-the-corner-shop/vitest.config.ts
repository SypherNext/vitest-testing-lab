import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Every tag a test uses must be listed here (see the markers lesson).
    tags: [
      { name: "slow", description: "Tests that take a noticeable amount of time." },
      { name: "database", description: "Tests that use the SQLite database." },
    ],

    // Coverage is measured only when you ask for it:  npm.cmd run test:step -- 25 --coverage
    coverage: {
      provider: "v8",
      // Measure the shop code. The tests themselves are not counted.
      include: ["src/**/*.ts"],
      // These two files hold only types, so there is no code in them to run.
      exclude: ["src/order.ts", "src/ports.ts"],
      reporter: ["text"],
      // A rule the run must meet. If coverage drops below one of these numbers, the run fails.
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },
    },
  },
});
