import { beforeEach, describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// This is the FIXED version of a test file that used to fail at random.
// The broken version is in demos/flaky-shuffle. The bug: one cart was created at the top of the file and shared by
// every test, so what a test saw depended on which tests had run before it.
// The fix: build a new cart before every test, so each test starts from the same known state.

describe("Cart (each test has its own cart)", () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
  });

  test("starts empty", () => {
    expect(cart.isEmpty).toBe(true);
  });

  test("holds a pen after one is added", () => {
    cart.addItem("PN-1", "Pen", 150);

    expect(cart.totalQuantity).toBe(1);
  });

  test("has a subtotal of 150 cents after one pen is added", () => {
    cart.addItem("PN-1", "Pen", 150);

    expect(cart.subtotal).toBe(150);
  });

  test("still starts empty when it runs after the tests above", () => {
    expect(cart.isEmpty).toBe(true);
    expect(cart.subtotal).toBe(0);
  });
});
