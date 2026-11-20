import { describe, expect, test } from "vitest";
import { applyDiscountCode } from "../src/discounts.ts";
import { DiscountError } from "../src/errors.ts";

describe("applyDiscountCode", () => {
  describe("without a code", () => {
    test("gives no discount when the code is undefined", () => {
      expect(applyDiscountCode(1148, undefined)).toEqual({ discountCents: 0, code: null });
    });

    test("gives no discount when the code is an empty string", () => {
      expect(applyDiscountCode(1148, "")).toEqual({ discountCents: 0, code: null });
    });

    test("gives no discount when the code is only spaces", () => {
      expect(applyDiscountCode(1148, "   ")).toEqual({ discountCents: 0, code: null });
    });
  });

  describe("SAVE10", () => {
    test("takes 10% off, rounded half up", () => {
      expect(applyDiscountCode(1148, "SAVE10")).toEqual({ discountCents: 115, code: "SAVE10" });
    });

    test("works in lower case and with spaces around it", () => {
      expect(applyDiscountCode(1000, "  save10 ")).toEqual({ discountCents: 100, code: "SAVE10" });
    });
  });

  describe("SAVE25", () => {
    test("takes 25% off when the subtotal is exactly $50.00", () => {
      expect(applyDiscountCode(5000, "SAVE25")).toEqual({ discountCents: 1250, code: "SAVE25" });
    });

    test("is refused when the subtotal is one cent below $50.00", () => {
      expect(() => applyDiscountCode(4999, "SAVE25")).toThrow(DiscountError);
      expect(() => applyDiscountCode(4999, "SAVE25")).toThrow("SAVE25 needs a subtotal of at least $50.00");
    });
  });

  describe("WELCOME5", () => {
    test("takes 500 cents off", () => {
      expect(applyDiscountCode(1148, "WELCOME5")).toEqual({ discountCents: 500, code: "WELCOME5" });
    });

    test("never takes off more than the subtotal", () => {
      expect(applyDiscountCode(300, "WELCOME5")).toEqual({ discountCents: 300, code: "WELCOME5" });
    });
  });

  describe("an unknown code", () => {
    test("is refused, and the message shows the code as it was typed", () => {
      expect(() => applyDiscountCode(1148, " Summer ")).toThrow(DiscountError);
      expect(() => applyDiscountCode(1148, " Summer ")).toThrow("unknown discount code: Summer");
    });
  });
});
