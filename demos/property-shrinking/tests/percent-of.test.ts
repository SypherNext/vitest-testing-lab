import fc from "fast-check";
import { expect, test } from "vitest";
import { percentOf } from "../src/money.ts";

// A deliberately wrong rule: "10% of any amount is always less than $10.00 (1000 cents)".
// It holds for small amounts and breaks for big ones. fast-check first finds some big amount that breaks the rule,
// then SHRINKS it: it tries smaller and smaller amounts until it finds the smallest one that still breaks the rule.
// That smallest amount is the edge where the rule stops being true, which is the most useful thing to see.
// The fixed seed makes the run the same every time, so the output in the lesson can be checked.
test("10% of any amount is less than 1000 cents", () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 1_000_000 }), (cents) => {
      expect(percentOf(cents, 10)).toBeLessThan(1000);
    }),
    { seed: 42 },
  );
});
