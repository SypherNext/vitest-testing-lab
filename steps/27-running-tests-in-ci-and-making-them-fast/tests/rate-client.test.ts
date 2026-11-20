import { afterEach, describe, expect, test, vi } from "vitest";
import { RateUnavailableError } from "../src/errors.ts";
import { RateClient } from "../src/rate-client.ts";

// The RateClient calls the global fetch function. In these tests we swap fetch for a stand-in,
// so no test ever touches the real network: tests that use the network are slow and break when the network does.

const BASE_URL = "https://rates.example.test";

// Makes fetch answer with a ready-made response, like a stub.
function stubFetchWithJson(body: unknown, status = 200) {
  const fetchStub = vi.fn(async (_url: string) => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}

afterEach(() => {
  // Puts the real fetch back after every test.
  vi.unstubAllGlobals();
});

describe("RateClient.getRate", () => {
  test("asks the service for the rate between two currencies", async () => {
    const fetchStub = stubFetchWithJson({ rate: 0.92 });
    const client = new RateClient(BASE_URL);

    await client.getRate("USD", "EUR");

    expect(fetchStub).toHaveBeenCalledWith("https://rates.example.test/rates?from=USD&to=EUR");
  });

  test("returns the rate from the answer", async () => {
    stubFetchWithJson({ rate: 0.92 });
    const client = new RateClient(BASE_URL);

    await expect(client.getRate("USD", "EUR")).resolves.toBe(0.92);
  });

  test("rejects with RateUnavailableError when the service answers with an error status", async () => {
    stubFetchWithJson({ message: "try later" }, 503);
    const client = new RateClient(BASE_URL);

    await expect(client.getRate("USD", "EUR")).rejects.toThrow(RateUnavailableError);
    await expect(client.getRate("USD", "EUR")).rejects.toThrow("exchange rate service answered with status 503");
  });

  test("rejects when the network is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const client = new RateClient(BASE_URL);

    await expect(client.getRate("USD", "EUR")).rejects.toThrow("exchange rate service is not reachable");
  });

  test.each([
    { why: "the rate is text", body: { rate: "high" } },
    { why: "the rate is zero", body: { rate: 0 } },
    { why: "the rate is negative", body: { rate: -1 } },
    { why: "there is no rate", body: {} },
  ])("rejects when $why", async ({ body }) => {
    stubFetchWithJson(body);
    const client = new RateClient(BASE_URL);

    await expect(client.getRate("USD", "EUR")).rejects.toThrow("exchange rate service sent an invalid rate");
  });

  test("rejects when the answer is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>oops</html>")));
    const client = new RateClient(BASE_URL);

    await expect(client.getRate("USD", "EUR")).rejects.toThrow("exchange rate service sent an invalid rate");
  });
});

describe("RateClient.convert", () => {
  test("multiplies the cents by the rate", async () => {
    stubFetchWithJson({ rate: 0.92 });
    const client = new RateClient(BASE_URL);

    await expect(client.convert(1000, "USD", "EUR")).resolves.toBe(920);
  });

  test("rounds half a cent up", async () => {
    stubFetchWithJson({ rate: 0.5 });
    const client = new RateClient(BASE_URL);

    await expect(client.convert(999, "USD", "EUR")).resolves.toBe(500);
  });
});
