import { RateUnavailableError } from "./errors.ts";

// Asks an exchange-rate web service how many units of one currency one unit of another is worth.
// It calls the global `fetch` function, which is what a test replaces to avoid the real network.
export class RateClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // getRate("USD", "EUR") -> 0.92 means 1 USD is worth 0.92 EUR.
  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const url = `${this.baseUrl}/rates?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new RateUnavailableError("exchange rate service is not reachable");
    }
    if (!response.ok) {
      throw new RateUnavailableError(`exchange rate service answered with status ${response.status}`);
    }
    return await this.readRate(response);
  }

  // Converts an amount of cents, rounding half a cent up (the same rule as percentOf).
  async convert(cents: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const rate = await this.getRate(fromCurrency, toCurrency);
    return Math.floor(cents * rate + 0.5);
  }

  private async readRate(response: Response): Promise<number> {
    let body: { rate?: unknown };
    try {
      body = await response.json();
    } catch {
      throw new RateUnavailableError("exchange rate service sent an invalid rate");
    }
    if (typeof body.rate !== "number" || !(body.rate > 0)) {
      throw new RateUnavailableError("exchange rate service sent an invalid rate");
    }
    return body.rate;
  }
}
