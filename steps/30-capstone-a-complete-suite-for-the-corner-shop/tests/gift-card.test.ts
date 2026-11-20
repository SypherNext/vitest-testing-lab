import { describe, expect, test } from "vitest";
import { InsufficientBalanceError, InvalidAmountError } from "../src/errors.ts";
import { GiftCard } from "../src/gift-card.ts";

// This file was written one test at a time, before the code it tests (test-driven development):
//   1. Red:      write one small test and watch it fail.
//   2. Green:    write the least code that makes it pass.
//   3. Refactor: tidy the code while every test stays green.
// The tests below are in the order they were written.

describe("GiftCard", () => {
  // Cycle 1
  test("starts with the balance it was created with", () => {
    const card = new GiftCard(5000);

    expect(card.balanceCents).toBe(5000);
  });

  // Cycle 2
  test("redeeming takes the amount off the balance", () => {
    const card = new GiftCard(5000);

    card.redeem(1200);

    expect(card.balanceCents).toBe(3800);
  });

  test("redeeming returns the balance that is left", () => {
    const card = new GiftCard(5000);

    expect(card.redeem(1200)).toBe(3800);
  });

  // Cycle 3
  test("refuses to redeem more than the balance", () => {
    const card = new GiftCard(1000);

    expect(() => card.redeem(1001)).toThrow(InsufficientBalanceError);
    expect(() => card.redeem(1001)).toThrow("gift card has $10.00 left, cannot redeem $10.01");
  });

  test("keeps the balance when a redeem is refused", () => {
    const card = new GiftCard(1000);

    expect(() => card.redeem(1001)).toThrow();

    expect(card.balanceCents).toBe(1000);
  });

  test("can redeem the whole balance, which uses the card up", () => {
    const card = new GiftCard(1000);

    card.redeem(1000);

    expect(card.balanceCents).toBe(0);
    expect(card.isUsedUp).toBe(true);
  });

  // Cycle 4: this one made us notice two copies of the same check, so the refactor step moved it into one function.
  test.each([0, -5, 2.5, Number.NaN])("refuses to redeem %s cents", (amountCents) => {
    const card = new GiftCard(1000);

    expect(() => card.redeem(amountCents)).toThrow(InvalidAmountError);
  });

  test.each([0, -5, 2.5])("refuses to create a card with a balance of %s cents", (balanceCents) => {
    expect(() => new GiftCard(balanceCents)).toThrow("amount must be a positive whole number of cents");
  });

  test("a card with money left is not used up", () => {
    const card = new GiftCard(1000);

    expect(card.isUsedUp).toBe(false);
  });
});
