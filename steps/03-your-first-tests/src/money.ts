// Money is always a whole number of cents, so we never add up 0.1 + 0.2 and get a surprise.

// 1250 -> "$12.50", 123456 -> "$1,234.56", -320 -> "-$3.20"
export function formatPrice(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absoluteCents = Math.abs(cents);
  const dollars = Math.floor(absoluteCents / 100);
  const remainingCents = absoluteCents % 100;

  const dollarsWithCommas = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${dollarsWithCommas}.${String(remainingCents).padStart(2, "0")}`;
}

// The share of an amount, rounded half up: 50% of 5 cents is 2.5 cents, which becomes 3.
export function percentOf(cents: number, percent: number): number {
  return Math.floor((cents * percent + 50) / 100);
}
