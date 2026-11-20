import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { systemClock } from "../src/clock.ts";
import { UnknownReservationError } from "../src/errors.ts";
import { ReservationBook } from "../src/reservations.ts";
import { ManualClock } from "./support/fakes.ts";

const START = new Date("2026-03-14T09:30:00Z");
const ONE_MINUTE = 60 * 1000;

// Way 1: hand the book a clock that the test controls. No timers needed.
describe("ReservationBook with a clock we pass in", () => {
  test("a new hold is not expired", () => {
    const book = new ReservationBook(new ManualClock(START));

    book.hold("ORD-1001");

    expect(book.isExpired("ORD-1001")).toBe(false);
  });

  test("a hold is still alive one minute before the 15 minutes are up", () => {
    const clock = new ManualClock(START);
    const book = new ReservationBook(clock);
    book.hold("ORD-1001");

    clock.advanceMinutes(14);

    expect(book.isExpired("ORD-1001")).toBe(false);
  });

  test("a hold expires at the exact moment the 15 minutes are up", () => {
    const clock = new ManualClock(START);
    const book = new ReservationBook(clock);
    book.hold("ORD-1001");

    clock.advanceMinutes(15);

    expect(book.isExpired("ORD-1001")).toBe(true);
  });

  test("a hold can ask for a different number of minutes", () => {
    const clock = new ManualClock(START);
    const book = new ReservationBook(clock);
    book.hold("ORD-1001", 5);

    clock.advanceMinutes(5);

    expect(book.isExpired("ORD-1001")).toBe(true);
  });

  test("holding an order again starts its time again", () => {
    const clock = new ManualClock(START);
    const book = new ReservationBook(clock);
    book.hold("ORD-1001");
    clock.advanceMinutes(10);

    book.hold("ORD-1001");
    clock.advanceMinutes(10);

    expect(book.isExpired("ORD-1001")).toBe(false);
  });

  test("asking about an order that was never held throws UnknownReservationError", () => {
    const book = new ReservationBook(new ManualClock(START));

    expect(() => book.isExpired("ORD-9999")).toThrow(UnknownReservationError);
    expect(() => book.isExpired("ORD-9999")).toThrow("no reservation for ORD-9999");
  });

  describe("sweep", () => {
    test("removes the expired holds and returns their ids", () => {
      const clock = new ManualClock(START);
      const book = new ReservationBook(clock);
      book.hold("ORD-1001", 5);
      book.hold("ORD-1002", 30);
      book.hold("ORD-1003", 10);

      clock.advanceMinutes(10);
      const removed = book.sweep();

      expect(removed).toEqual(["ORD-1001", "ORD-1003"]);
      expect(book.isExpired("ORD-1002")).toBe(false);
    });

    test("forgets a removed hold", () => {
      const clock = new ManualClock(START);
      const book = new ReservationBook(clock);
      book.hold("ORD-1001", 5);
      clock.advanceMinutes(5);

      book.sweep();

      expect(() => book.isExpired("ORD-1001")).toThrow(UnknownReservationError);
    });

    test("returns an empty list when nothing has expired", () => {
      const book = new ReservationBook(new ManualClock(START));
      book.hold("ORD-1001");

      expect(book.sweep()).toEqual([]);
    });
  });
});

// Way 2: leave the real clock in place and fake the time of the whole test process.
// vi.useFakeTimers() freezes time. vi.setSystemTime() sets what "now" is. vi.advanceTimersByTime() moves it on.
describe("ReservationBook with the real clock and fake timers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => {
    // Always give the real timers back, or every later test in this file would run on fake time.
    vi.useRealTimers();
  });

  test("the system clock now reads the time we set", () => {
    expect(systemClock.now()).toEqual(START);
  });

  test("advancing the fake time expires a hold", () => {
    const book = new ReservationBook();
    book.hold("ORD-1001");

    vi.advanceTimersByTime(14 * ONE_MINUTE);
    expect(book.isExpired("ORD-1001")).toBe(false);

    vi.advanceTimersByTime(ONE_MINUTE);
    expect(book.isExpired("ORD-1001")).toBe(true);
  });

  test("setSystemTime can jump straight to a moment", () => {
    const book = new ReservationBook();
    book.hold("ORD-1001");

    vi.setSystemTime(new Date("2026-03-14T09:44:59.999Z"));
    expect(book.isExpired("ORD-1001")).toBe(false);

    vi.setSystemTime(new Date("2026-03-14T09:45:00Z"));
    expect(book.isExpired("ORD-1001")).toBe(true);
  });
});
