import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { applyDiscountCode } from "../src/discounts.ts";
import { shippingCost } from "../src/shipping.ts";

const someSubtotal = fc.integer({ min: 0, max: 1_000_000 });

describe("applyDiscountCode", () => {
  test("never takes off more than the subtotal and never a negative amount", () => {
    fc.assert(
      fc.property(someSubtotal, fc.constantFrom("SAVE10", "WELCOME5"), (subtotalCents, code) => {
        const { discountCents } = applyDiscountCode(subtotalCents, code);

        expect(discountCents).toBeGreaterThanOrEqual(0);
        expect(discountCents).toBeLessThanOrEqual(subtotalCents);
      }),
    );
  });

  test("lets SAVE25 take off a quarter, rounded, once the subtotal is $50.00 or more", () => {
    fc.assert(
      fc.property(fc.integer({ min: 5000, max: 1_000_000 }), (subtotalCents) => {
        const { discountCents } = applyDiscountCode(subtotalCents, "SAVE25");

        expect(Math.abs(discountCents * 4 - subtotalCents)).toBeLessThanOrEqual(2);
      }),
    );
  });

  test("treats a code the same in any mix of upper and lower case", () => {
    fc.assert(
      fc.property(someSubtotal, fc.boolean(), fc.boolean(), (subtotalCents, shout, addSpaces) => {
        const typed = `${addSpaces ? "  " : ""}${shout ? "SAVE10" : "save10"}${addSpaces ? " " : ""}`;

        expect(applyDiscountCode(subtotalCents, typed)).toEqual(applyDiscountCode(subtotalCents, "SAVE10"));
      }),
    );
  });
});

describe("shippingCost", () => {
  test("is only ever 0 or 499", () => {
    fc.assert(
      fc.property(someSubtotal, (subtotalCents) => {
        expect([0, 499]).toContain(shippingCost(subtotalCents));
      }),
    );
  });

  test("is free from $50.00 up", () => {
    fc.assert(
      fc.property(fc.integer({ min: 5000, max: 10_000_000 }), (subtotalCents) => {
        expect(shippingCost(subtotalCents)).toBe(0);
      }),
    );
  });

  test("is 499 for every subtotal from 1 to 4999", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 4999 }), (subtotalCents) => {
        expect(shippingCost(subtotalCents)).toBe(499);
      }),
    );
  });
});
