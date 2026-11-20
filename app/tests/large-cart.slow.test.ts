import { describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";

// Another way to mark tests: put them in a file whose name says what they are, here "*.slow.test.ts".
// Run only these files with:  npm.cmd run test:step -- 20 slow
// Leave them out with a tag or a folder rule in your own project; the idea is the same.

describe("a very large cart", () => {
  test("keeps 20000 different items and adds them up", () => {
    const cart = new Cart();

    for (let number = 1; number <= 20_000; number += 1) {
      cart.addItem(`SKU-${number}`, `Item ${number}`, 100);
    }

    expect(cart.totalQuantity).toBe(20_000);
    expect(cart.subtotal).toBe(2_000_000);
  });
});
