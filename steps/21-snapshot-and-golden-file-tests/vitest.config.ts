import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Every tag a test uses must be listed here. A tag that is not listed is an error,
    // so a typo such as "slwo" is caught instead of silently doing nothing.
    tags: [
      { name: "slow", description: "Tests that take a noticeable amount of time." },
      { name: "database", description: "Tests that use the SQLite database." },
    ],
  },
});
