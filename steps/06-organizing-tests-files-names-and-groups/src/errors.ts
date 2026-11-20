// Every error the shop throws on purpose extends ShopError, so callers can catch them all with one check.
export class ShopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidQuantityError extends ShopError {
  constructor() {
    super("quantity must be a positive whole number");
  }
}

export class InvalidPriceError extends ShopError {
  constructor() {
    super("unit price must be greater than zero");
  }
}

export class UnknownItemError extends ShopError {
  constructor(sku: string) {
    super(`no item with sku ${sku}`);
  }
}
