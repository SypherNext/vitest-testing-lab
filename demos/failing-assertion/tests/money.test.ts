import { expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

test("formatPrice shows 1250 cents as $12.50", () => {
  expect(formatPrice(1250)).toBe("$12.50");
});

test("percentOf finds 10% of 1999 cents", () => {
  expect(percentOf(1999, 10)).toBe(200);
});

test("percentOf rounds half a cent up, so 50% of 5 cents is 3", () => {
  expect(percentOf(5, 50)).toBe(3);
});
