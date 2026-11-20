import { expect, test } from "vitest";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Two slow tests and three quick ones. The slowest-tests script should rank the two slow ones first.
test("waits a long time (400 milliseconds)", async () => {
  await wait(400);
  expect(true).toBe(true);
});

test("waits a short time (150 milliseconds)", async () => {
  await wait(150);
  expect(true).toBe(true);
});

test("adds two numbers", () => {
  expect(1 + 1).toBe(2);
});

test("joins two words", () => {
  expect(`${"corner"} ${"shop"}`).toBe("corner shop");
});

test("compares two lists", () => {
  expect([1, 2, 3]).toEqual([1, 2, 3]);
});
