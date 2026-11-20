import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/receipt.ts"],
      reporter: ["text"],
      // The rule is stricter than the tests can meet: one branch of receipt.ts is never run.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
