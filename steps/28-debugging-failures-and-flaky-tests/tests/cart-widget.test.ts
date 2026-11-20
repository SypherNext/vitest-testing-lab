// @vitest-environment happy-dom
import { fireEvent, getByRole, getByText, queryByText } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";
import { renderCartWidget } from "../src/ui/cart-widget.ts";
import { buildCartWithNotebooksAndAPen } from "./support/cart-builder.ts";

// The line at the top tells Vitest to run this file in happy-dom: a pretend web page made of plain code,
// with `document`, `button` and `click`, but no real browser window. It is fast, and good enough for most checks.
//
// @testing-library/dom finds things the way a person would: by the words on the screen or by the role of the
// element (a button, a heading), not by the CSS class or the shape of the HTML. Tests that look for what a person
// sees keep working when the HTML underneath is rearranged.

describe("renderCartWidget", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    // Take the widget off the page so the next test starts with a clean page.
    container.remove();
  });

  describe("with an empty cart", () => {
    test("shows a friendly message", () => {
      renderCartWidget(container, new Cart());

      expect(queryByText(container, "Your cart is empty.")).not.toBeNull();
    });

    test("shows no Remove button and no total", () => {
      renderCartWidget(container, new Cart());

      expect(queryByText(container, "Remove")).toBeNull();
      expect(queryByText(container, /Total/)).toBeNull();
    });
  });

  describe("with items in the cart", () => {
    test("shows each line with its quantity, name and price", () => {
      renderCartWidget(container, buildCartWithNotebooksAndAPen());

      expect(getByText(container, "2 x Notebook")).toBeDefined();
      expect(getByText(container, "$9.98")).toBeDefined();
      expect(getByText(container, "1 x Pen")).toBeDefined();
      expect(getByText(container, "$1.50")).toBeDefined();
    });

    test("shows the total", () => {
      renderCartWidget(container, buildCartWithNotebooksAndAPen());

      expect(getByText(container, "Total: $11.48")).toBeDefined();
    });

    test("counts the items", () => {
      renderCartWidget(container, buildCartWithNotebooksAndAPen());

      expect(getByText(container, "3 items")).toBeDefined();
    });

    test("says '1 item' for a single item", () => {
      const cart = new Cart();
      cart.addItem("PN-1", "Pen", 150);

      renderCartWidget(container, cart);

      expect(getByText(container, "1 item")).toBeDefined();
    });

    test("gives each Remove button a name that says which item it removes", () => {
      renderCartWidget(container, buildCartWithNotebooksAndAPen());

      expect(getByRole(container, "button", { name: "Remove Notebook" })).toBeDefined();
      expect(getByRole(container, "button", { name: "Remove Pen" })).toBeDefined();
    });
  });

  describe("when the shopper clicks Remove", () => {
    test("takes that line off the screen", () => {
      renderCartWidget(container, buildCartWithNotebooksAndAPen());

      fireEvent.click(getByRole(container, "button", { name: "Remove Notebook" }));

      expect(queryByText(container, "2 x Notebook")).toBeNull();
      expect(getByText(container, "1 x Pen")).toBeDefined();
    });

    test("updates the total", () => {
      renderCartWidget(container, buildCartWithNotebooksAndAPen());

      fireEvent.click(getByRole(container, "button", { name: "Remove Notebook" }));

      expect(getByText(container, "Total: $1.50")).toBeDefined();
    });

    test("also removes the item from the cart itself", () => {
      const cart = buildCartWithNotebooksAndAPen();
      renderCartWidget(container, cart);

      fireEvent.click(getByRole(container, "button", { name: "Remove Pen" }));

      expect(cart.lines().map((line) => line.sku)).toEqual(["NB-1"]);
    });

    test("shows the empty message again after the last item is removed", () => {
      const cart = new Cart();
      cart.addItem("PN-1", "Pen", 150);
      renderCartWidget(container, cart);

      fireEvent.click(getByRole(container, "button", { name: "Remove Pen" }));

      expect(queryByText(container, "Your cart is empty.")).not.toBeNull();
    });
  });
});
