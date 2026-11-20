// A deliberately broken version of money.ts, used to show what a failing test looks like.
// The bug: percentOf rounds a half cent DOWN instead of up, so 50% of 5 cents becomes 2 and not 3.

export function formatPrice(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absoluteCents = Math.abs(cents);
  const dollars = Math.floor(absoluteCents / 100);
  const remainingCents = absoluteCents % 100;

  const dollarsWithCommas = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${dollarsWithCommas}.${String(remainingCents).padStart(2, "0")}`;
}

export function percentOf(cents: number, percent: number): number {
  return Math.ceil((cents * percent - 50) / 100);
}
