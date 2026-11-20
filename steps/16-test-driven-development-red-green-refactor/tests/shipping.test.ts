import { describe, expect, test } from "vitest";
import { shippingCost } from "../src/shipping.ts";

// Six tests that differ only in their numbers become one test with a table of rows.
// $subtotalCents and $expected in the name are replaced with the values of each row.
describe("shippingCost", () => {
  test.each([
    { subtotalCents: 1, expected: 499, why: "a tiny order pays the fee" },
    { subtotalCents: 1033, expected: 499, why: "a small order pays the fee" },
    { subtotalCents: 4999, expected: 499, why: "one cent below $50.00 still pays" },
    { subtotalCents: 5000, expected: 0, why: "exactly $50.00 is free" },
    { subtotalCents: 12000, expected: 0, why: "over $50.00 is free" },
    { subtotalCents: 0, expected: 0, why: "an empty cart has nothing to ship" },
  ])("costs $expected cents for a subtotal of $subtotalCents ($why)", ({ subtotalCents, expected }) => {
    expect(shippingCost(subtotalCents)).toBe(expected);
  });
});
