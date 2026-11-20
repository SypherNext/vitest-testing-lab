// Step 2 of test-driven development: the least code that makes the test pass.
export class GiftCard {
  private balance: number;

  constructor(initialBalanceCents: number) {
    this.balance = initialBalanceCents;
  }

  get balanceCents(): number {
    return this.balance;
  }
}
