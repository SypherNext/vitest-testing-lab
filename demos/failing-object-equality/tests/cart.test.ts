import { expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// A deliberate mistake: the test expects a quantity of 3, but the cart holds 2 notebooks.
// Look at how Vitest shows the difference between the two objects.
test("lines lists the items in the order they were added", () => {
  const cart = new Cart();
  cart.addItem("NB-1", "Notebook", 499, 2);
  cart.addItem("PN-1", "Pen", 150);

  expect(cart.lines()).toEqual([
    { sku: "NB-1", name: "Notebook", unitPriceCents: 499, quantity: 3, lineTotalCents: 998 },
    { sku: "PN-1", name: "Pen", unitPriceCents: 150, quantity: 1, lineTotalCents: 150 },
  ]);
});
