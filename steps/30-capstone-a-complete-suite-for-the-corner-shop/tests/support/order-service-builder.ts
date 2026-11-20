import { OrderService } from "../../src/order-service.ts";
import type { Notifier, Payments } from "../../src/ports.ts";
import { FakeInventory, FixedClock, SpyNotifier, StubPayments } from "./fakes.ts";

// Facts that many test files use. They live here once, so a test file does not repeat them.
export const CUSTOMER_EMAIL = "sam@example.com";
export const PLACED_AT = new Date("2026-03-14T09:30:00Z");

interface ServiceOptions<ChosenNotifier extends Notifier> {
  stock?: Record<string, number>;
  payments?: Payments;
  notifier?: ChosenNotifier;
}

// Builds an OrderService wired to stand-ins, with sensible defaults: plenty of stock, payments that always
// work, a spy for the notifier and a frozen clock. A test overrides only the one thing it cares about,
// so the thing it cares about stands out. (The <...> only tells TypeScript that the notifier we give back
// is a SpyNotifier unless the test passed a different one.)
export function buildOrderService<ChosenNotifier extends Notifier = SpyNotifier>(
  options: ServiceOptions<ChosenNotifier> = {},
) {
  const inventory = new FakeInventory(options.stock ?? { "NB-1": 10, "PN-1": 10, "BG-1": 10 });
  const payments = options.payments ?? new StubPayments();
  const notifier = (options.notifier ?? new SpyNotifier()) as ChosenNotifier;
  const service = new OrderService(inventory, payments, notifier, new FixedClock(PLACED_AT));
  return { service, inventory, payments, notifier };
}
