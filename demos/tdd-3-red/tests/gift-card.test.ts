import { expect, test } from "vitest";
import { GiftCard } from "../src/gift-card.ts";

test("starts with the balance it was created with", () => {
  const card = new GiftCard(5000);

  expect(card.balanceCents).toBe(5000);
});

// Cycle 2, red: a new test for something that is not built yet.
test("redeeming takes the amount off the balance", () => {
  const card = new GiftCard(5000);

  // @ts-expect-error redeem does not exist yet; the test runner still runs the test, and it fails
  card.redeem(1200);

  expect(card.balanceCents).toBe(3800);
});
