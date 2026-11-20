// The code at the end of cycle 1. Cycle 2 starts with a new test for redeem, which does not exist yet.
export class GiftCard {
  private balance: number;

  constructor(initialBalanceCents: number) {
    this.balance = initialBalanceCents;
  }

  get balanceCents(): number {
    return this.balance;
  }
}
