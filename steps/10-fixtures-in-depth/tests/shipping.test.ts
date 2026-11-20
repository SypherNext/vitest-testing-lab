import { describe, expect, test } from "vitest";
import { shippingCost } from "../src/shipping.ts";

describe("shippingCost", () => {
  test("is 499 cents for a small order", () => {
    expect(shippingCost(1033)).toBe(499);
  });

  test("is 499 cents for an order one cent below $50.00", () => {
    expect(shippingCost(4999)).toBe(499);
  });

  test("is free for an order of exactly $50.00", () => {
    expect(shippingCost(5000)).toBe(0);
  });

  test("is free for an order over $50.00", () => {
    expect(shippingCost(12000)).toBe(0);
  });

  test("is 499 cents for an order of 1 cent", () => {
    expect(shippingCost(1)).toBe(499);
  });

  test("is free for an empty cart, because there is nothing to ship", () => {
    expect(shippingCost(0)).toBe(0);
  });
});
