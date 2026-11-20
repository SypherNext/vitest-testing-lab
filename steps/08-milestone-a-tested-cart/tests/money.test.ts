import { describe, expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

// Layout rule: one test file per source file. src/money.ts is tested in tests/money.test.ts.
// Naming rule: the describe name says what is tested, the test name finishes the sentence.
//   describe("formatPrice") + test("shows 1250 cents as $12.50")  reads as  "formatPrice shows 1250 cents as $12.50".

describe("formatPrice", () => {
  test("shows 1250 cents as $12.50", () => {
    expect(formatPrice(1250)).toBe("$12.50");
  });

  test("shows zero cents as $0.00", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  test("pads a single digit of cents with a zero", () => {
    expect(formatPrice(5)).toBe("$0.05");
  });

  test("puts a comma between thousands", () => {
    expect(formatPrice(123456)).toBe("$1,234.56");
  });

  test("puts the minus sign before the dollar sign", () => {
    expect(formatPrice(-320)).toBe("-$3.20");
  });

  describe("at the edges", () => {
    test("shows 1 cent as $0.01", () => {
      expect(formatPrice(1)).toBe("$0.01");
    });

    test("shows 99 cents and then 100 cents on either side of a dollar", () => {
      expect(formatPrice(99)).toBe("$0.99");
      expect(formatPrice(100)).toBe("$1.00");
    });

    test("shows -0 as $0.00, with no minus sign", () => {
      expect(formatPrice(-0)).toBe("$0.00");
    });
  });

  describe("with bad input", () => {
    test("throws a TypeError when the cents are not a whole number", () => {
      expect(() => formatPrice(12.5)).toThrow(TypeError);
      expect(() => formatPrice(12.5)).toThrow("cents must be an integer");
    });
  });
});

describe("percentOf", () => {
  test("finds 10% of 1999 cents", () => {
    expect(percentOf(1999, 10)).toBe(200);
  });

  test("rounds half a cent up, so 50% of 5 cents is 3", () => {
    expect(percentOf(5, 50)).toBe(3);
  });

  test("gives 0 when the percent is 0", () => {
    expect(percentOf(1999, 0)).toBe(0);
  });

  test("gives the whole amount when the percent is 100", () => {
    expect(percentOf(1999, 100)).toBe(1999);
  });

  describe("at the rounding point", () => {
    test("rounds 49.5 cents up to 50 but 49.4 cents down to 49", () => {
      expect(percentOf(495, 10)).toBe(50);
      expect(percentOf(494, 10)).toBe(49);
    });
  });

  describe("with bad input", () => {
    test("throws a TypeError when the cents are not a whole number", () => {
      expect(() => percentOf(10.5, 10)).toThrow("cents must be an integer");
    });

    test("throws a TypeError when the percent is not a whole number", () => {
      expect(() => percentOf(1000, 12.5)).toThrow("percent must be an integer");
    });
  });
});
