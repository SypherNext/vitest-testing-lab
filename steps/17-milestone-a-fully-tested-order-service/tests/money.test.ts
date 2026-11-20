import { describe, expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

describe("formatPrice", () => {
  // test.each with rows of [input, expected]: %i is a whole number, %s is text.
  test.each([
    [1250, "$12.50"],
    [0, "$0.00"],
    [5, "$0.05"],
    [123456, "$1,234.56"],
    [-320, "-$3.20"],
    [1, "$0.01"],
    [99, "$0.99"],
    [100, "$1.00"],
    [-0, "$0.00"],
  ])("shows %i cents as %s", (cents, expected) => {
    expect(formatPrice(cents)).toBe(expected);
  });

  test("throws a TypeError when the cents are not a whole number", () => {
    expect(() => formatPrice(12.5)).toThrow(TypeError);
    expect(() => formatPrice(12.5)).toThrow("cents must be an integer");
  });
});

describe("percentOf", () => {
  test.each([
    { cents: 1999, percent: 10, expected: 200, why: "plain rounding up" },
    { cents: 5, percent: 50, expected: 3, why: "half a cent rounds up" },
    { cents: 1999, percent: 0, expected: 0, why: "0% is nothing" },
    { cents: 1999, percent: 100, expected: 1999, why: "100% is everything" },
    { cents: 495, percent: 10, expected: 50, why: "49.5 rounds up" },
    { cents: 494, percent: 10, expected: 49, why: "49.4 rounds down" },
  ])("finds $percent% of $cents cents: $expected ($why)", ({ cents, percent, expected }) => {
    expect(percentOf(cents, percent)).toBe(expected);
  });

  test.each([
    { cents: 10.5, percent: 10, message: "cents must be an integer" },
    { cents: 1000, percent: 12.5, message: "percent must be an integer" },
  ])("throws a TypeError for $cents cents and $percent%: $message", ({ cents, percent, message }) => {
    expect(() => percentOf(cents, percent)).toThrow(TypeError);
    expect(() => percentOf(cents, percent)).toThrow(message);
  });
});
