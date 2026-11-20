import { InsufficientBalanceError, InvalidAmountError } from "./errors.ts";

// Both the starting balance and every redeemed amount must be a positive whole number of cents.
// This check started as two copies, one in the constructor and one in redeem. We moved it here (the refactor step).
function assertPositiveWholeCents(amountCents: number): void {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new InvalidAmountError();
  }
}

// A gift card holds a balance. Redeeming takes money off it, and the balance can never go below zero.
export class GiftCard {
  private balance: number;

  constructor(initialBalanceCents: number) {
    assertPositiveWholeCents(initialBalanceCents);
    this.balance = initialBalanceCents;
  }

  get balanceCents(): number {
    return this.balance;
  }

  get isUsedUp(): boolean {
    return this.balance === 0;
  }

  // Takes the amount off the card and returns what is left.
  redeem(amountCents: number): number {
    assertPositiveWholeCents(amountCents);
    if (amountCents > this.balance) {
      throw new InsufficientBalanceError(this.balance, amountCents);
    }
    this.balance -= amountCents;
    return this.balance;
  }
}
