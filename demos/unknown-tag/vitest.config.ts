import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    tags: [{ name: "slow", description: "Tests that take a noticeable amount of time." }],
  },
});
