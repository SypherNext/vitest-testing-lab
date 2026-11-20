import { expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// Money is a whole number of cents: a Notebook is 499 cents ($4.99) and a Pen is 150 cents ($1.50).

test("a new cart is empty", () => {
  const cart = new Cart();

  expect(cart.isEmpty).toBe(true);
  expect(cart.totalQuantity).toBe(0);
  expect(cart.subtotal).toBe(0);
});

test("the subtotal is the unit price times the quantity", () => {
  const cart = new Cart();

  cart.addItem("NB-1", "Notebook", 499, 2);

  expect(cart.subtotal).toBe(998);
});

test("the subtotal adds up every line", () => {
  const cart = new Cart();

  cart.addItem("NB-1", "Notebook", 499, 2);
  cart.addItem("PN-1", "Pen", 150);

  expect(cart.subtotal).toBe(1148);
});

test("the quantity defaults to 1", () => {
  const cart = new Cart();

  cart.addItem("PN-1", "Pen", 150);

  expect(cart.totalQuantity).toBe(1);
});

test("adding the same item twice adds the quantity", () => {
  const cart = new Cart();

  cart.addItem("PN-1", "Pen", 150, 2);
  cart.addItem("PN-1", "Pen", 150, 3);

  expect(cart.totalQuantity).toBe(5);
  expect(cart.lines()).toHaveLength(1);
});

test("adding the same item again keeps the price of the first add", () => {
  const cart = new Cart();

  cart.addItem("PN-1", "Pen", 150);
  cart.addItem("PN-1", "Pen", 175);

  expect(cart.subtotal).toBe(300);
});

// toBe checks "is this exactly the same value or object?". toEqual checks "does it look the same inside?".

test("lines lists the items in the order they were added", () => {
  const cart = new Cart();
  cart.addItem("NB-1", "Notebook", 499, 2);
  cart.addItem("PN-1", "Pen", 150);

  expect(cart.lines()).toEqual([
    { sku: "NB-1", name: "Notebook", unitPriceCents: 499, quantity: 2, lineTotalCents: 998 },
    { sku: "PN-1", name: "Pen", unitPriceCents: 150, quantity: 1, lineTotalCents: 150 },
  ]);
});

test("each call to lines returns new objects, so toBe fails but toEqual passes", () => {
  const cart = new Cart();
  cart.addItem("PN-1", "Pen", 150);

  const firstCall = cart.lines();
  const secondCall = cart.lines();

  expect(firstCall).not.toBe(secondCall);
  expect(firstCall).toEqual(secondCall);
});

test("changing a returned line does not change the cart", () => {
  const cart = new Cart();
  cart.addItem("PN-1", "Pen", 150);

  cart.lines()[0].quantity = 99;

  expect(cart.totalQuantity).toBe(1);
});

test("one line can be checked with toMatchObject, which ignores the other fields", () => {
  const cart = new Cart();
  cart.addItem("NB-1", "Notebook", 499, 2);

  expect(cart.lines()[0]).toMatchObject({ sku: "NB-1", lineTotalCents: 998 });
});

test("a list of names can be checked for one name with toContain", () => {
  const cart = new Cart();
  cart.addItem("NB-1", "Notebook", 499);
  cart.addItem("PN-1", "Pen", 150);

  const names = cart.lines().map((line) => line.name);

  expect(names).toContain("Pen");
  expect(names).toEqual(["Notebook", "Pen"]);
});

// Decimal fractions cannot be stored exactly in a float, which is why the shop uses whole cents.

test("floats are not exact: 0.1 + 0.2 is not 0.3", () => {
  expect(0.1 + 0.2).not.toBe(0.3);
});

test("toBeCloseTo is the right way to compare floats", () => {
  expect(0.1 + 0.2).toBeCloseTo(0.3);
});

test("whole cents add up exactly, so toBe is safe", () => {
  expect(10 + 20).toBe(30);

  const cart = new Cart();
  cart.addItem("A-1", "Ten cents", 10);
  cart.addItem("B-1", "Twenty cents", 20);
  expect(cart.subtotal).toBe(30);
});
