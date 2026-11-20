import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// A generator describes the kind of values to make up. This one makes a list of items with different skus.
const someItems = fc.uniqueArray(
  fc.record({
    sku: fc.stringMatching(/^[A-Z]{2}-[0-9]$/),
    unitPriceCents: fc.integer({ min: 1, max: 100_000 }),
    quantity: fc.integer({ min: 1, max: 50 }),
  }),
  { selector: (item) => item.sku, maxLength: 20 },
);

type Item = { sku: string; unitPriceCents: number; quantity: number };

function cartWith(items: Item[]): Cart {
  const cart = new Cart();
  for (const item of items) {
    cart.addItem(item.sku, `Item ${item.sku}`, item.unitPriceCents, item.quantity);
  }
  return cart;
}

describe("Cart", () => {
  test("has a subtotal equal to the sum of price times quantity", () => {
    fc.assert(
      fc.property(someItems, (items) => {
        const expected = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);

        expect(cartWith(items).subtotal).toBe(expected);
      }),
    );
  });

  test("has a total quantity equal to the sum of the quantities", () => {
    fc.assert(
      fc.property(someItems, (items) => {
        const expected = items.reduce((total, item) => total + item.quantity, 0);

        expect(cartWith(items).totalQuantity).toBe(expected);
      }),
    );
  });

  test("has the same subtotal whatever order the items are added in", () => {
    fc.assert(
      fc.property(someItems, (items) => {
        expect(cartWith([...items].reverse()).subtotal).toBe(cartWith(items).subtotal);
      }),
    );
  });

  test("adds the quantities when the same item is added twice", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), fc.integer({ min: 1, max: 1000 }), (first, second) => {
        const cart = new Cart();

        cart.addItem("PN-1", "Pen", 150, first);
        cart.addItem("PN-1", "Pen", 150, second);

        expect(cart.totalQuantity).toBe(first + second);
        expect(cart.lines()).toHaveLength(1);
      }),
    );
  });

  test("is empty again after every item is removed", () => {
    fc.assert(
      fc.property(someItems, (items) => {
        const cart = cartWith(items);

        for (const item of items) {
          cart.removeItem(item.sku);
        }

        expect(cart.isEmpty).toBe(true);
        expect(cart.subtotal).toBe(0);
      }),
    );
  });
});
