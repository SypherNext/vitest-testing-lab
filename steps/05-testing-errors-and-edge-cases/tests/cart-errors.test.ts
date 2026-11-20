import { expect, test } from "vitest";
import { Cart } from "../src/cart.ts";
import { InvalidPriceError, InvalidQuantityError, ShopError, UnknownItemError } from "../src/errors.ts";

// To test that code throws, wrap the call in a function and give that function to expect.
// Writing expect(cart.addItem(...)).toThrow() would not work: the error would be thrown before expect runs.

test("adding a quantity of 0 throws InvalidQuantityError", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", 150, 0)).toThrow(InvalidQuantityError);
});

test("the quantity error explains the rule in its message", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", 150, -2)).toThrow("quantity must be a positive whole number");
});

test("toThrow can also match part of the message with a regular expression", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", 150, 1.5)).toThrow(/positive whole number/);
});

test("a price of 0 throws InvalidPriceError", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", 0)).toThrow(InvalidPriceError);
});

test("a negative price throws InvalidPriceError with its message", () => {
  const cart = new Cart();

  expect(() => cart.addItem("PN-1", "Pen", -150)).toThrow("unit price must be greater than zero");
});

test("removing an item that is not in the cart names the sku", () => {
  const cart = new Cart();

  expect(() => cart.removeItem("XX-9")).toThrow("no item with sku XX-9");
});

test("removing an item takes it out of the cart", () => {
  const cart = new Cart();
  cart.addItem("PN-1", "Pen", 150);

  cart.removeItem("PN-1");

  expect(cart.isEmpty).toBe(true);
});

test("every shop error can be caught as a ShopError", () => {
  const cart = new Cart();

  expect(() => cart.removeItem("XX-9")).toThrow(ShopError);
  expect(() => cart.addItem("PN-1", "Pen", 0)).toThrow(ShopError);
});

test("the error has a name that says what went wrong", () => {
  const cart = new Cart();

  try {
    cart.removeItem("XX-9");
    expect.unreachable("removeItem should have thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(UnknownItemError);
    expect((error as Error).name).toBe("UnknownItemError");
  }
});

// Edge cases: the values right at the edge of what is allowed.

test("a quantity of 1 is the smallest allowed quantity", () => {
  const cart = new Cart();

  cart.addItem("PN-1", "Pen", 150, 1);

  expect(cart.totalQuantity).toBe(1);
});

test("a price of 1 cent is the smallest allowed price", () => {
  const cart = new Cart();

  cart.addItem("SW-1", "Sweet", 1);

  expect(cart.subtotal).toBe(1);
});

test("a rejected add leaves the cart as it was", () => {
  const cart = new Cart();
  cart.addItem("PN-1", "Pen", 150);

  expect(() => cart.addItem("PN-1", "Pen", 150, 0)).toThrow();

  expect(cart.totalQuantity).toBe(1);
});
