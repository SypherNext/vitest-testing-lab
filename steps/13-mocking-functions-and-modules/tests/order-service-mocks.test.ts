import { afterEach, describe, expect, test, vi } from "vitest";
import { applyDiscountCode } from "../src/discounts.ts";
import { OrderService } from "../src/order-service.ts";
import type { Notifier, Payments } from "../src/ports.ts";
import { buildCartWithNotebooksAndAPen } from "./support/cart-builder.ts";
import { FakeInventory, FixedClock } from "./support/fakes.ts";

// vi.mock is moved to the top of the file before the imports run. It replaces the module at that path,
// so every file that imports it (including src/order-service.ts) gets the replacement.
// Mock the module that the code under test imports: the path points at src/discounts.ts, not at a copy of it.
vi.mock("../src/discounts.ts", () => ({
  applyDiscountCode: vi.fn(),
}));

const CUSTOMER = "sam@example.com";
const ACCEPTED_PAYMENT = { ok: true, receiptId: "RCPT-7" } as const;

function buildService(payments: Payments, notifier: Notifier = { sendOrderConfirmation: vi.fn() }) {
  const inventory = new FakeInventory({ "NB-1": 10, "PN-1": 10 });
  const clock = new FixedClock(new Date("2026-03-14T09:30:00Z"));
  const service = new OrderService(inventory, payments, notifier, clock);
  return { service, inventory };
}

afterEach(() => {
  // Puts back anything vi.spyOn replaced, so one test cannot leak into the next.
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

describe("vi.fn: a stand-in function that records its calls", () => {
  test("charge is called once with the email and the total", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const charge = vi.fn<Payments["charge"]>().mockReturnValue(ACCEPTED_PAYMENT);
    const { service } = buildService({ charge });

    service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(charge).toHaveBeenCalledTimes(1);
    expect(charge).toHaveBeenCalledWith(CUSTOMER, 1647);
  });

  test("mockReturnValueOnce gives a different answer for the first call only", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const charge = vi
      .fn<Payments["charge"]>()
      .mockReturnValueOnce({ ok: false, reason: "card expired" })
      .mockReturnValue(ACCEPTED_PAYMENT);
    const { service } = buildService({ charge });

    expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow("card expired");
    const secondTry = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(secondTry.receiptId).toBe("RCPT-7");
    expect(charge).toHaveBeenCalledTimes(2);
  });

  test("the payment is taken before the confirmation is sent", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const charge = vi.fn<Payments["charge"]>().mockReturnValue(ACCEPTED_PAYMENT);
    const sendOrderConfirmation = vi.fn<Notifier["sendOrderConfirmation"]>();
    const { service } = buildService({ charge }, { sendOrderConfirmation });

    service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    const chargedAt = charge.mock.invocationCallOrder[0];
    const sentAt = sendOrderConfirmation.mock.invocationCallOrder[0];
    expect(chargedAt).toBeLessThan(sentAt);
  });

  test("the confirmation gets the finished order", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const sendOrderConfirmation = vi.fn<Notifier["sendOrderConfirmation"]>();
    const { service } = buildService({ charge: () => ACCEPTED_PAYMENT }, { sendOrderConfirmation });

    const order = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(sendOrderConfirmation).toHaveBeenCalledWith(CUSTOMER, order);
  });
});

describe("vi.spyOn: watch a real method, and keep or replace what it does", () => {
  test("a spy keeps the real behaviour unless told otherwise", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const { service, inventory } = buildService({ charge: () => ACCEPTED_PAYMENT });
    const reserve = vi.spyOn(inventory, "reserve");

    service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(reserve).toHaveBeenCalledWith("NB-1", 2);
    expect(reserve).toHaveBeenCalledWith("PN-1", 1);
    expect(inventory.available("NB-1")).toBe(8); // the real reserve still ran
  });

  test("mockImplementation replaces the real behaviour", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const { service, inventory } = buildService({ charge: () => ACCEPTED_PAYMENT });
    vi.spyOn(inventory, "reserve").mockImplementation(() => {});

    service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(inventory.available("NB-1")).toBe(10); // the stand-in reserve did nothing
  });

  test("restoreAllMocks puts the real method back", () => {
    const { inventory } = buildService({ charge: () => ACCEPTED_PAYMENT });
    const original = inventory.reserve;
    vi.spyOn(inventory, "reserve").mockImplementation(() => {});

    vi.restoreAllMocks();

    expect(inventory.reserve).toBe(original);
  });
});

describe("vi.mock: replace a whole module", () => {
  test("the order service uses the replaced applyDiscountCode", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 1000, code: "MOCKED" });
    const { service } = buildService({ charge: () => ACCEPTED_PAYMENT });

    const order = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, "ANYTHING");

    expect(applyDiscountCode).toHaveBeenCalledWith(1148, "ANYTHING");
    expect(order.discountCode).toBe("MOCKED");
    expect(order.totalCents).toBe(1148 - 1000 + 499);
  });

  test("a module mock hides the real rules, so unknown codes no longer fail here", () => {
    vi.mocked(applyDiscountCode).mockReturnValue({ discountCents: 0, code: null });
    const { service } = buildService({ charge: () => ACCEPTED_PAYMENT });

    const order = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, "NOT-A-REAL-CODE");

    expect(order.discountCents).toBe(0);
  });
});
