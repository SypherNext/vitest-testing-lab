import { afterEach, expect, test, vi } from "vitest";
import { RateClient } from "../src/rate-client.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

// Two traps with promises. Both tests were written by someone who forgot an `await`.

test("trap 1: expect(promise) is compared before the answer has arrived", async () => {
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ rate: 0.92 })));
  const client = new RateClient("https://rates.example.test");

  const rate = client.getRate("USD", "EUR"); // no await: this is a Promise, not a number

  expect(rate).toBe(0.92);
});

test("trap 2: .rejects is not awaited, so the test would finish before the check is made", async () => {
  vi.stubGlobal("fetch", async () => new Response("{}", { status: 503 }));
  const client = new RateClient("https://rates.example.test");

  expect(client.getRate("USD", "EUR")).rejects.toThrow("status 503"); // no await in front of expect
});
