import type { Cart } from "../cart.ts";
import { formatPrice } from "../money.ts";

function createElement<Tag extends keyof HTMLElementTagNameMap>(
  container: HTMLElement,
  tag: Tag,
  text?: string,
): HTMLElementTagNameMap[Tag] {
  const element = container.ownerDocument.createElement(tag);
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function itemCountText(count: number): string {
  return count === 1 ? "1 item" : `${count} items`;
}

// Draws the cart inside the container: a list of lines with a Remove button each, the item count and the total.
// When a Remove button is clicked the cart changes and the widget draws itself again.
export function renderCartWidget(container: HTMLElement, cart: Cart): void {
  container.replaceChildren();

  if (cart.isEmpty) {
    container.append(createElement(container, "p", "Your cart is empty."));
    return;
  }

  const list = createElement(container, "ul");
  for (const line of cart.lines()) {
    const item = createElement(container, "li");
    item.append(
      createElement(container, "span", `${line.quantity} x ${line.name}`),
      createElement(container, "span", formatPrice(line.lineTotalCents)),
    );

    const removeButton = createElement(container, "button", "Remove");
    removeButton.setAttribute("aria-label", `Remove ${line.name}`);
    removeButton.addEventListener("click", () => {
      cart.removeItem(line.sku);
      renderCartWidget(container, cart);
    });
    item.append(removeButton);

    list.append(item);
  }

  container.append(
    list,
    createElement(container, "p", itemCountText(cart.totalQuantity)),
    createElement(container, "p", `Total: ${formatPrice(cart.subtotal)}`),
  );
}
