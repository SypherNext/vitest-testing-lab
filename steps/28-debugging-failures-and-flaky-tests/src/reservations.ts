import { systemClock } from "./clock.ts";
import { UnknownReservationError } from "./errors.ts";
import type { Clock } from "./ports.ts";

const DEFAULT_HOLD_MINUTES = 15;
const MILLISECONDS_PER_MINUTE = 60_000;

// Remembers which orders are holding stock, and until when. A hold that runs out is "expired".
export class ReservationBook {
  private readonly expiryByOrderId = new Map<string, Date>();
  private readonly clock: Clock;

  // With no clock given, the book reads the real time.
  constructor(clock: Clock = systemClock) {
    this.clock = clock;
  }

  // Holding an order that is already held starts its time again.
  hold(orderId: string, minutes: number = DEFAULT_HOLD_MINUTES): void {
    const expiresAt = new Date(this.clock.now().getTime() + minutes * MILLISECONDS_PER_MINUTE);
    this.expiryByOrderId.set(orderId, expiresAt);
  }

  // A hold expires at the exact moment its time is up.
  isExpired(orderId: string): boolean {
    const expiresAt = this.expiryByOrderId.get(orderId);
    if (!expiresAt) {
      throw new UnknownReservationError(orderId);
    }
    return this.clock.now().getTime() >= expiresAt.getTime();
  }

  // Removes every expired hold and returns the order ids that were removed.
  sweep(): string[] {
    const expiredOrderIds = [...this.expiryByOrderId.keys()].filter((orderId) => this.isExpired(orderId));
    for (const orderId of expiredOrderIds) {
      this.expiryByOrderId.delete(orderId);
    }
    return expiredOrderIds;
  }
}
