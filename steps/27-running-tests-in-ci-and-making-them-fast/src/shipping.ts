export const FREE_SHIPPING_FROM_CENTS = 5000;
export const SHIPPING_FEE_CENTS = 499;

// Shipping is worked out on the subtotal after the discount.
export function shippingCost(subtotalAfterDiscountCents: number): number {
  if (subtotalAfterDiscountCents <= 0) {
    return 0; // an empty cart ships nothing
  }
  if (subtotalAfterDiscountCents >= FREE_SHIPPING_FROM_CENTS) {
    return 0;
  }
  return SHIPPING_FEE_CENTS;
}
