import { DiscountError } from "./errors.ts";
import { formatPrice, percentOf } from "./money.ts";

export interface DiscountResult {
  discountCents: number;
  code: string | null;
}

const SAVE25_MINIMUM_SUBTOTAL_CENTS = 5000;
const WELCOME5_AMOUNT_CENTS = 500;

// A rule takes the subtotal and says how many cents to take off.
type DiscountRule = (subtotalCents: number) => number;

// To add a new code, add one line here. applyDiscountCode does not change.
const discountRules = new Map<string, DiscountRule>([
  ["SAVE10", (subtotalCents) => percentOf(subtotalCents, 10)],
  [
    "SAVE25",
    (subtotalCents) => {
      if (subtotalCents < SAVE25_MINIMUM_SUBTOTAL_CENTS) {
        throw new DiscountError(`SAVE25 needs a subtotal of at least ${formatPrice(SAVE25_MINIMUM_SUBTOTAL_CENTS)}`);
      }
      return percentOf(subtotalCents, 25);
    },
  ],
  // The discount can never be more than the subtotal, so the total never goes below zero.
  ["WELCOME5", (subtotalCents) => Math.min(WELCOME5_AMOUNT_CENTS, subtotalCents)],
]);

// Codes are not case-sensitive and spaces around them are ignored.
export function applyDiscountCode(subtotalCents: number, code?: string | null): DiscountResult {
  const typedCode = code?.trim() ?? "";
  if (typedCode === "") {
    return { discountCents: 0, code: null };
  }

  const normalizedCode = typedCode.toUpperCase();
  const rule = discountRules.get(normalizedCode);
  if (!rule) {
    throw new DiscountError(`unknown discount code: ${typedCode}`);
  }
  return { discountCents: rule(subtotalCents), code: normalizedCode };
}
