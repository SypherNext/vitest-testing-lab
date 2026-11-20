import { expect, test } from "vitest";
import { GiftCard } from "../src/gift-card.ts";

test("starts with the balance it was created with", () => {
  const card = new GiftCard(5000);

  expect(card.balanceCents).toBe(5000);
});
