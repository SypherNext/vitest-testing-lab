import { expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

test("formatPrice throws a TypeError when the cents are not a whole number", () => {
  expect(() => formatPrice(12.5)).toThrow(TypeError);
  expect(() => formatPrice(12.5)).toThrow("cents must be an integer");
});

test("percentOf throws a TypeError when the cents are not a whole number", () => {
  expect(() => percentOf(10.5, 10)).toThrow("cents must be an integer");
});

test("percentOf throws a TypeError when the percent is not a whole number", () => {
  expect(() => percentOf(1000, 12.5)).toThrow("percent must be an integer");
});

// Edge cases for money: the smallest, the largest and the values around a rounding point.

test("formatPrice shows 1 cent as $0.01", () => {
  expect(formatPrice(1)).toBe("$0.01");
});

test("formatPrice shows 99 cents and then 100 cents on either side of a dollar", () => {
  expect(formatPrice(99)).toBe("$0.99");
  expect(formatPrice(100)).toBe("$1.00");
});

test("formatPrice shows -0 as $0.00, with no minus sign", () => {
  expect(formatPrice(-0)).toBe("$0.00");
});

test("percentOf rounds 49.5 cents up to 50 but 49.4 cents down to 49", () => {
  expect(percentOf(495, 10)).toBe(50);
  expect(percentOf(494, 10)).toBe(49);
});
