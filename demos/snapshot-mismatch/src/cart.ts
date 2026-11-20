import { InvalidPriceError, InvalidQuantityError, UnknownItemError } from "./errors.ts";

export interface CartLine {
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

interface CartItem {
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

// A shopping cart. Items are kept by sku (the shop's code for a product), in the order they were added.
export class Cart {
  private readonly items = new Map<string, CartItem>();

  // Adding a sku that is already in the cart adds to its quantity. The first price stays.
  addItem(sku: string, name: string, unitPriceCents: number, quantity = 1): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidQuantityError();
    }
    if (!Number.isInteger(unitPriceCents) || unitPriceCents <= 0) {
      throw new InvalidPriceError();
    }

    const existing = this.items.get(sku);
    if (existing) {
      existing.quantity += quantity;
      return;
    }
    this.items.set(sku, { sku, name, unitPriceCents, quantity });
  }

  removeItem(sku: string): void {
    if (!this.items.delete(sku)) {
      throw new UnknownItemError(sku);
    }
  }

  get isEmpty(): boolean {
    return this.items.size === 0;
  }

  get totalQuantity(): number {
    return this.lines().reduce((total, line) => total + line.quantity, 0);
  }

  get subtotal(): number {
    return this.lines().reduce((total, line) => total + line.lineTotalCents, 0);
  }

  // Returns fresh objects, so changing a returned line never changes the cart.
  lines(): CartLine[] {
    return [...this.items.values()].map((item) => ({
      ...item,
      lineTotalCents: item.unitPriceCents * item.quantity,
    }));
  }
}
