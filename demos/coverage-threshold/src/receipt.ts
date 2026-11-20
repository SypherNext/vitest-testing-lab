import { formatPrice } from "./money.ts";
import type { Order } from "./order.ts";
import { toReceiptTime } from "./timestamps.ts";

const RECEIPT_WIDTH = 30;
const SEPARATOR = "-".repeat(RECEIPT_WIDTH);

// A label on the left and an amount on the right, with spaces between so the row is exactly 30 characters wide.
function row(label: string, amount: string): string {
  const spaces = " ".repeat(Math.max(1, RECEIPT_WIDTH - label.length - amount.length));
  return `${label}${spaces}${amount}`;
}

function discountRow(order: Order): string {
  const label = order.discountCode ? `Discount (${order.discountCode})` : "Discount";
  return row(label, formatPrice(-order.discountCents));
}

// Turns a finished order into the text printed on the paper receipt.
export function renderReceipt(order: Order): string {
  const itemRows = order.lines.map((line) => row(`${line.quantity} x ${line.name}`, formatPrice(line.lineTotalCents)));
  const discountRows = order.discountCents > 0 ? [discountRow(order)] : [];

  return [
    "CORNER SHOP",
    `Order ${order.id}   ${toReceiptTime(order.placedAt)}`,
    SEPARATOR,
    ...itemRows,
    SEPARATOR,
    row("Subtotal", formatPrice(order.subtotalCents)),
    ...discountRows,
    row("Shipping", formatPrice(order.shippingCents)),
    row("Total", formatPrice(order.totalCents)),
  ].join("\n");
}
