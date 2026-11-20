import { expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// Three deliberate mistakes about errors. Each one fails in a different way.

test("mistake 1: the error is thrown, but the test does not expect it", () => {
  const cart = new Cart();

  cart.addItem("PN-1", "Pen", 150, 0); // throws InvalidQuantityError, and nothing catches it

  expect(cart.isEmpty).toBe(true);
});

test("mistake 2: the test expects an error, but none is thrown", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", 150, 1)).toThrow();
});

test("mistake 3: an error is thrown, but with a different message", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", 150, 0)).toThrow("quantity must be positive");
});
