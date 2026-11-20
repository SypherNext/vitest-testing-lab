import { expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

// The same three checks as manual-check.ts, now written for a real test runner.

test("formatPrice turns 1250 cents into $12.50", () => {
  expect(formatPrice(1250)).toBe("$12.50");
});

test("formatPrice turns 0 cents into $0.00", () => {
  expect(formatPrice(0)).toBe("$0.00");
});

test("percentOf finds 10% of 1999 cents", () => {
  expect(percentOf(1999, 10)).toBe(200);
});
