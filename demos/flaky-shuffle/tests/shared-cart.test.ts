import { expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// THE BUG: one cart is created here, at the top of the file, and shared by every test.
// The tests only pass when they run in the order they are written, because the second test
// leaves a pen in the cart and the third test quietly depends on it.
const cart = new Cart();

test("starts empty", () => {
  expect(cart.isEmpty).toBe(true);
});

test("holds a pen after one is added", () => {
  cart.addItem("PN-1", "Pen", 150);

  expect(cart.totalQuantity).toBe(1);
});

test("has a subtotal of 150 cents after one pen is added", () => {
  expect(cart.subtotal).toBe(150); // it never adds the pen itself: it relies on the test before
});
