import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from "vitest";

// This file only prints a line at each moment, so you can see in what order Vitest runs the hooks.
beforeAll(() => console.log("1. beforeAll (once, before the first test)"));
afterAll(() => console.log("9. afterAll (once, after the last test)"));
beforeEach(() => console.log("   beforeEach (before every test)"));
afterEach(() => console.log("   afterEach (after every test)"));

describe("a group of tests", () => {
  beforeEach(() => console.log("   beforeEach inside the group"));
  afterEach(() => console.log("   afterEach inside the group"));

  test("first test", () => console.log("   -> first test runs"));
  test("second test", () => console.log("   -> second test runs"));
});
