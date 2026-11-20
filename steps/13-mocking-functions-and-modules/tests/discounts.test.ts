import { describe, expect, test } from "vitest";
import { applyDiscountCode } from "../src/discounts.ts";
import { DiscountError } from "../src/errors.ts";

describe("applyDiscountCode", () => {
  describe("without a code", () => {
    // test.each with an array of values: %s is replaced by the value of each row.
    test.each([undefined, null, "", "   "])("gives no discount when the code is %j", (code) => {
      expect(applyDiscountCode(1148, code)).toEqual({ discountCents: 0, code: null });
    });
  });

  describe("with a code that works", () => {
    test.each([
      { subtotalCents: 1148, typed: "SAVE10", discountCents: 115, code: "SAVE10" },
      { subtotalCents: 1000, typed: "  save10 ", discountCents: 100, code: "SAVE10" },
      { subtotalCents: 5000, typed: "SAVE25", discountCents: 1250, code: "SAVE25" },
      { subtotalCents: 1148, typed: "WELCOME5", discountCents: 500, code: "WELCOME5" },
      { subtotalCents: 300, typed: "WELCOME5", discountCents: 300, code: "WELCOME5" },
    ])(
      "takes $discountCents cents off a subtotal of $subtotalCents for the code '$typed'",
      ({ subtotalCents, typed, discountCents, code }) => {
        expect(applyDiscountCode(subtotalCents, typed)).toEqual({ discountCents, code });
      },
    );
  });

  describe("with a code that is refused", () => {
    test.each([
      {
        subtotalCents: 4999,
        typed: "SAVE25",
        why: "the subtotal is one cent too low",
        message: "SAVE25 needs a subtotal of at least $50.00",
      },
      { subtotalCents: 1148, typed: " Summer ", why: "nobody knows it", message: "unknown discount code: Summer" },
      { subtotalCents: 1148, typed: "save 10", why: "a space is not allowed", message: "unknown discount code: save 10" },
    ])("throws a DiscountError for '$typed' because $why", ({ subtotalCents, typed, message }) => {
      expect(() => applyDiscountCode(subtotalCents, typed)).toThrow(DiscountError);
      expect(() => applyDiscountCode(subtotalCents, typed)).toThrow(message);
    });
  });
});
