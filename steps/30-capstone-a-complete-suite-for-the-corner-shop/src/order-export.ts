import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Logger } from "./logger.ts";
import type { Order } from "./order.ts";
import { toIsoSeconds } from "./timestamps.ts";

const CSV_HEADER = ["id", "email", "placedAt", "subtotalCents", "discountCents", "shippingCents", "totalCents"];

// A field with a comma, a quote or a new line must be wrapped in quotes, and a quote inside is written twice.
function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvLine(fields: Array<string | number>): string {
  return `${fields.map(csvField).join(",")}\n`;
}

export function ordersToCsv(orders: Order[]): string {
  const rows = orders.map((order) =>
    csvLine([
      order.id,
      order.email,
      toIsoSeconds(order.placedAt),
      order.subtotalCents,
      order.discountCents,
      order.shippingCents,
      order.totalCents,
    ]),
  );
  return csvLine(CSV_HEADER) + rows.join("");
}

// Writes the orders to a CSV file (creating the folder if needed) and logs what it did.
export async function exportOrdersToFile(orders: Order[], filePath: string, logger: Logger): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, ordersToCsv(orders), "utf8");

  for (const order of orders) {
    logger.debug(`exported ${order.id}`);
  }
  logger.info(`exported ${orders.length} orders to ${filePath}`);
}
