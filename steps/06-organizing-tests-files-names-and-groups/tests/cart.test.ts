import { describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";
import { InvalidPriceError, InvalidQuantityError, ShopError, UnknownItemError } from "../src/errors.ts";

// Money is a whole number of cents: a Notebook is 499 cents ($4.99) and a Pen is 150 cents ($1.50).

describe("Cart", () => {
  describe("a new cart", () => {
    test("is empty", () => {
      const cart = new Cart();

      expect(cart.isEmpty).toBe(true);
      expect(cart.totalQuantity).toBe(0);
      expect(cart.subtotal).toBe(0);
    });
  });

  describe("addItem", () => {
    test("defaults the quantity to 1", () => {
      const cart = new Cart();

      cart.addItem("PN-1", "Pen", 150);

      expect(cart.totalQuantity).toBe(1);
    });

    test("adds the quantity when the same item is added twice", () => {
      const cart = new Cart();

      cart.addItem("PN-1", "Pen", 150, 2);
      cart.addItem("PN-1", "Pen", 150, 3);

      expect(cart.totalQuantity).toBe(5);
      expect(cart.lines()).toHaveLength(1);
    });

    test("keeps the price of the first add when the same item is added again", () => {
      const cart = new Cart();

      cart.addItem("PN-1", "Pen", 150);
      cart.addItem("PN-1", "Pen", 175);

      expect(cart.subtotal).toBe(300);
    });

    test("accepts a quantity of 1, the smallest allowed", () => {
      const cart = new Cart();

      cart.addItem("PN-1", "Pen", 150, 1);

      expect(cart.totalQuantity).toBe(1);
    });

    test("accepts a price of 1 cent, the smallest allowed", () => {
      const cart = new Cart();

      cart.addItem("SW-1", "Sweet", 1);

      expect(cart.subtotal).toBe(1);
    });

    describe("with a bad quantity", () => {
      test("throws InvalidQuantityError for a quantity of 0", () => {
        const cart = new Cart();

        expect(() => cart.addItem("PN-1", "Pen", 150, 0)).toThrow(InvalidQuantityError);
      });

      test("explains the rule in the message", () => {
        const cart = new Cart();

        expect(() => cart.addItem("PN-1", "Pen", 150, -2)).toThrow("quantity must be a positive whole number");
      });

      test("matches part of the message with a regular expression", () => {
        const cart = new Cart();

        expect(() => cart.addItem("PN-1", "Pen", 150, 1.5)).toThrow(/positive whole number/);
      });

      test("leaves the cart as it was", () => {
        const cart = new Cart();
        cart.addItem("PN-1", "Pen", 150);

        expect(() => cart.addItem("PN-1", "Pen", 150, 0)).toThrow();

        expect(cart.totalQuantity).toBe(1);
      });
    });

    describe("with a bad price", () => {
      test("throws InvalidPriceError for a price of 0", () => {
        const cart = new Cart();

        expect(() => cart.addItem("PN-1", "Pen", 0)).toThrow(InvalidPriceError);
      });

      test("explains the rule in the message for a negative price", () => {
        const cart = new Cart();

        expect(() => cart.addItem("PN-1", "Pen", -150)).toThrow("unit price must be greater than zero");
      });
    });
  });

  describe("removeItem", () => {
    test("takes the item out of the cart", () => {
      const cart = new Cart();
      cart.addItem("PN-1", "Pen", 150);

      cart.removeItem("PN-1");

      expect(cart.isEmpty).toBe(true);
    });

    test("names the sku when the item is not in the cart", () => {
      const cart = new Cart();

      expect(() => cart.removeItem("XX-9")).toThrow("no item with sku XX-9");
    });

    test("throws an error with a name that says what went wrong", () => {
      const cart = new Cart();

      try {
        cart.removeItem("XX-9");
        expect.unreachable("removeItem should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnknownItemError);
        expect((error as Error).name).toBe("UnknownItemError");
      }
    });
  });

  describe("errors", () => {
    test("can all be caught as a ShopError", () => {
      const cart = new Cart();

      expect(() => cart.removeItem("XX-9")).toThrow(ShopError);
      expect(() => cart.addItem("PN-1", "Pen", 0)).toThrow(ShopError);
    });
  });

  describe("subtotal", () => {
    test("is the unit price times the quantity", () => {
      const cart = new Cart();

      cart.addItem("NB-1", "Notebook", 499, 2);

      expect(cart.subtotal).toBe(998);
    });

    test("adds up every line", () => {
      const cart = new Cart();

      cart.addItem("NB-1", "Notebook", 499, 2);
      cart.addItem("PN-1", "Pen", 150);

      expect(cart.subtotal).toBe(1148);
    });
  });

  // toBe checks "is this exactly the same value or object?". toEqual checks "does it look the same inside?".
  describe("lines", () => {
    test("lists the items in the order they were added", () => {
      const cart = new Cart();
      cart.addItem("NB-1", "Notebook", 499, 2);
      cart.addItem("PN-1", "Pen", 150);

      expect(cart.lines()).toEqual([
        { sku: "NB-1", name: "Notebook", unitPriceCents: 499, quantity: 2, lineTotalCents: 998 },
        { sku: "PN-1", name: "Pen", unitPriceCents: 150, quantity: 1, lineTotalCents: 150 },
      ]);
    });

    test("returns new objects each time, so toBe fails but toEqual passes", () => {
      const cart = new Cart();
      cart.addItem("PN-1", "Pen", 150);

      const firstCall = cart.lines();
      const secondCall = cart.lines();

      expect(firstCall).not.toBe(secondCall);
      expect(firstCall).toEqual(secondCall);
    });

    test("returns copies, so changing a line does not change the cart", () => {
      const cart = new Cart();
      cart.addItem("PN-1", "Pen", 150);

      cart.lines()[0].quantity = 99;

      expect(cart.totalQuantity).toBe(1);
    });

    test("can be checked with toMatchObject, which ignores the other fields", () => {
      const cart = new Cart();
      cart.addItem("NB-1", "Notebook", 499, 2);

      expect(cart.lines()[0]).toMatchObject({ sku: "NB-1", lineTotalCents: 998 });
    });

    test("can be turned into a list of names and checked with toContain", () => {
      const cart = new Cart();
      cart.addItem("NB-1", "Notebook", 499);
      cart.addItem("PN-1", "Pen", 150);

      const names = cart.lines().map((line) => line.name);

      expect(names).toContain("Pen");
      expect(names).toEqual(["Notebook", "Pen"]);
    });
  });

  // Decimal fractions cannot be stored exactly in a float, which is why the shop uses whole cents.
  describe("money as whole cents", () => {
    test("0.1 + 0.2 is not 0.3 when they are floats", () => {
      expect(0.1 + 0.2).not.toBe(0.3);
    });

    test("toBeCloseTo is the right way to compare floats", () => {
      expect(0.1 + 0.2).toBeCloseTo(0.3);
    });

    test("whole cents add up exactly, so toBe is safe", () => {
      const cart = new Cart();

      cart.addItem("A-1", "Ten cents", 10);
      cart.addItem("B-1", "Twenty cents", 20);

      expect(cart.subtotal).toBe(30);
    });
  });
});
