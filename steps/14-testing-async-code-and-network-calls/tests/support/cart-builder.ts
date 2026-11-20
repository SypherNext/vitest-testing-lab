import { Cart } from "../../src/cart.ts";

// Many tests need the same cart: 2 notebooks ($9.98) and 1 pen ($1.50), a subtotal of 1148 cents.
// Building it in one place means a change to the example happens once, not in ten tests.
export function buildCartWithNotebooksAndAPen(): Cart {
  const cart = new Cart();
  cart.addItem("NB-1", "Notebook", 499, 2);
  cart.addItem("PN-1", "Pen", 150);
  return cart;
}
