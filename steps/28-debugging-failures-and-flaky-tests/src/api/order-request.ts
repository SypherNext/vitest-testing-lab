import { Cart } from "../cart.ts";
import { findProduct } from "../catalogue.ts";
import { ValidationError } from "../errors.ts";

export interface RequestedItem {
  sku: string;
  quantity: number;
}

export interface OrderRequest {
  email: string;
  discountCode: string | null;
  items: RequestedItem[];
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseItem(item: unknown): RequestedItem {
  if (!isPlainObject(item) || typeof item.sku !== "string" || item.sku === "") {
    throw new ValidationError("each item needs a sku");
  }
  if (typeof item.quantity !== "number") {
    throw new ValidationError("each item needs a quantity");
  }
  return { sku: item.sku, quantity: item.quantity };
}

// Checks the shape of the JSON body. It does not check business rules (stock, discount rules):
// those belong to the cart and the order service.
export function parseOrderRequest(body: unknown): OrderRequest {
  if (!isPlainObject(body)) {
    throw new ValidationError("request body must be a JSON object");
  }
  if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email)) {
    throw new ValidationError("email must be a valid email address");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new ValidationError("items must be a non-empty list");
  }
  if (body.discountCode !== undefined && body.discountCode !== null && typeof body.discountCode !== "string") {
    throw new ValidationError("discountCode must be text");
  }

  return {
    email: body.email,
    discountCode: body.discountCode ?? null,
    items: body.items.map(parseItem),
  };
}

// Fills a cart from the catalogue. The price always comes from the shop, never from the request.
export function cartFromItems(items: RequestedItem[]): Cart {
  const cart = new Cart();
  for (const item of items) {
    const product = findProduct(item.sku);
    if (!product) {
      throw new ValidationError(`unknown sku: ${item.sku}`);
    }
    cart.addItem(item.sku, product.name, product.unitPriceCents, item.quantity);
  }
  return cart;
}
