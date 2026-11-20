import { test as baseTest } from "vitest";
import { Cart } from "../../src/cart.ts";
import { buildCartWithNotebooksAndAPen } from "./cart-builder.ts";

interface ItemToAdd {
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity?: number;
}

// A fixture is a value a test asks for by name. Vitest builds it, hands it over, and cleans it up afterwards.
// Import this `test` instead of the one from "vitest" to get the fixtures below.
export const test = baseTest
  // "cart": a new, empty cart for every test that asks for it.
  .extend("cart", () => new Cart())

  // "filledCart": a fixture can use another fixture. This one takes the empty cart and fills it.
  // A test that asks for both "cart" and "filledCart" gets the same cart in both.
  .extend("filledCart", ({ cart }) => {
    cart.addItem("NB-1", "Notebook", 499, 2);
    cart.addItem("PN-1", "Pen", 150);
    return cart;
  })

  // "makeCart": a factory fixture. The value is a function, so a test can build carts of its own shape.
  .extend("makeCart", () => {
    return (items: ItemToAdd[]): Cart => {
      const newCart = new Cart();
      for (const item of items) {
        newCart.addItem(item.sku, item.name, item.unitPriceCents, item.quantity);
      }
      return newCart;
    };
  })

  // "cartAtRest": a cart that tests may only read, built once for the whole file and shared.
  // { scope: "file" } means "build it once per test file instead of once per test".
  .extend("cartAtRest", { scope: "file" }, () => buildCartWithNotebooksAndAPen());
