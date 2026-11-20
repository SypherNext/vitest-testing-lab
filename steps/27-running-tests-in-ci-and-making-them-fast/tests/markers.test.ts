import { describe, expect, test } from "vitest";
import { percentOf } from "../src/money.ts";

// Markers tell the runner something about a test: "skip it", "it is not written yet", "it fails on purpose".
// A marked test still shows up in the results, so nobody forgets it exists.

describe("markers", () => {
  // test.skip: the test is left out of the run. Use it for a short time, with a reason in the name.
  test.skip("shows a $5 gift card on the receipt (skipped until receipts show gift cards)", () => {
    expect("this test is not run").toBe("run");
  });

  // test.todo: a note to yourself. It has no body, so there is nothing to run.
  test.todo("refuses more than 99 of one item in the cart");
  test.todo("sends a reminder when a reservation is about to expire");

  // test.fails: the test passes only when its body FAILS. This records a bug we know about.
  // percentOf should refuse a percent above 100, but it does not yet. When someone fixes the bug,
  // this test starts failing, which is the signal to turn it into a normal test.
  test.fails("known bug: percentOf accepts a percent above 100", () => {
    expect(() => percentOf(1000, 150)).toThrow();
  });

  // test.skipIf: skip only when a condition is true. Here the slow check runs only when RUN_SLOW_CHECKS=1.
  const slowChecksAreOff = process.env.RUN_SLOW_CHECKS !== "1";

  test.skipIf(slowChecksAreOff)("runs the slow check when RUN_SLOW_CHECKS is 1", () => {
    expect(percentOf(1_000_000_000, 7)).toBe(70_000_000);
  });

  // test.runIf is the opposite of skipIf: run only when the condition is true.
  test.runIf(slowChecksAreOff)("runs the quick check when RUN_SLOW_CHECKS is not 1", () => {
    expect(percentOf(1000, 7)).toBe(70);
  });

  // A tag labels a test. The tag must be listed in vitest.config.ts. Pick tagged tests with --tags-filter.
  test("adds up a long list of numbers", { tags: ["slow"] }, () => {
    let total = 0;
    for (let number = 1; number <= 100_000; number += 1) {
      total += number;
    }
    expect(total).toBe(5_000_050_000);
  });
});
