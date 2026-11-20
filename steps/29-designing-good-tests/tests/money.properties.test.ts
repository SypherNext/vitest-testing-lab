import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { formatPrice, percentOf } from "../src/money.ts";

// An example-based test checks one input you chose: percentOf(1999, 10) is 200.
// A property-based test states a rule that must hold for ANY input, and the library tries many inputs
// (100 by default) that it makes up. If one breaks the rule, the library shrinks it to the smallest
// input that still breaks the rule, which makes the bug easy to see.

const someCents = fc.integer({ min: 0, max: 1_000_000 });
const somePercent = fc.integer({ min: 0, max: 100 });

describe("percentOf", () => {
  test("is never negative and never more than the amount", () => {
    fc.assert(
      fc.property(someCents, somePercent, (cents, percent) => {
        const share = percentOf(cents, percent);

        expect(share).toBeGreaterThanOrEqual(0);
        expect(share).toBeLessThanOrEqual(cents);
      }),
    );
  });

  test("0% is nothing and 100% is everything", () => {
    fc.assert(
      fc.property(someCents, (cents) => {
        expect(percentOf(cents, 0)).toBe(0);
        expect(percentOf(cents, 100)).toBe(cents);
      }),
    );
  });

  test("a bigger percent never gives a smaller share", () => {
    fc.assert(
      fc.property(someCents, somePercent, somePercent, (cents, firstPercent, secondPercent) => {
        const [lower, higher] = [firstPercent, secondPercent].sort((a, b) => a - b);

        expect(percentOf(cents, lower)).toBeLessThanOrEqual(percentOf(cents, higher));
      }),
    );
  });

  test("is within half a cent of the exact share", () => {
    fc.assert(
      fc.property(someCents, somePercent, (cents, percent) => {
        // Work in hundredths of a cent so every number stays whole.
        const differenceInHundredths = Math.abs(percentOf(cents, percent) * 100 - cents * percent);

        expect(differenceInHundredths).toBeLessThanOrEqual(50);
      }),
    );
  });
});

describe("formatPrice", () => {
  test("always has a dollar sign, thousands commas and exactly two digits of cents", () => {
    fc.assert(
      fc.property(someCents, (cents) => {
        expect(formatPrice(cents)).toMatch(/^\$\d{1,3}(,\d{3})*\.\d{2}$/);
      }),
    );
  });

  test("keeps every digit: removing the signs gives the cents back", () => {
    fc.assert(
      fc.property(someCents, (cents) => {
        const digitsOnly = formatPrice(cents).replace(/[$,.]/g, "");

        expect(Number(digitsOnly)).toBe(cents);
      }),
    );
  });

  test("shows a negative amount as a minus sign in front of the positive one", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), (cents) => {
        expect(formatPrice(-cents)).toBe(`-${formatPrice(cents)}`);
      }),
    );
  });
});
