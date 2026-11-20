export interface Product {
  name: string;
  unitPriceCents: number;
}

// The shop sells three things. The prices are in cents.
export const CATALOGUE: Readonly<Record<string, Product>> = {
  "NB-1": { name: "Notebook", unitPriceCents: 499 },
  "PN-1": { name: "Pen", unitPriceCents: 150 },
  "BG-1": { name: "Tote bag", unitPriceCents: 2500 },
};

export function findProduct(sku: string): Product | undefined {
  return Object.hasOwn(CATALOGUE, sku) ? CATALOGUE[sku] : undefined;
}
