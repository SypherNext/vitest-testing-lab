import { expect, test } from "vitest";

// The config lists one tag, "slow". This test uses "slwo" (a typo). Vitest refuses to run it,
// so a mistyped tag cannot quietly make a test fall out of a tagged run.
test("adds two numbers", { tags: ["slwo"] }, () => {
  expect(1 + 1).toBe(2);
});
