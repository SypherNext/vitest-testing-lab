import { expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

// Each test has three parts: arrange (get ready), act (call the code), assert (check the result).
// These tests are small, so the parts sit on one or two lines.

test("formatPrice shows 1250 cents as $12.50", () => {
  expect(formatPrice(1250)).toBe("$12.50");
});

test("formatPrice shows zero cents as $0.00", () => {
  expect(formatPrice(0)).toBe("$0.00");
});

test("formatPrice pads a single digit of cents with a zero", () => {
  expect(formatPrice(5)).toBe("$0.05");
});

test("formatPrice puts a comma between thousands", () => {
  expect(formatPrice(123456)).toBe("$1,234.56");
});

test("formatPrice puts the minus sign before the dollar sign", () => {
  expect(formatPrice(-320)).toBe("-$3.20");
});

test("percentOf finds 10% of 1999 cents", () => {
  expect(percentOf(1999, 10)).toBe(200);
});

test("percentOf rounds half a cent up, so 50% of 5 cents is 3", () => {
  expect(percentOf(5, 50)).toBe(3);
});

test("percentOf gives 0 when the percent is 0", () => {
  expect(percentOf(1999, 0)).toBe(0);
});

test("percentOf gives the whole amount when the percent is 100", () => {
  expect(percentOf(1999, 100)).toBe(1999);
});
