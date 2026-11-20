import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createLogger } from "../src/logger.ts";

// To check what was printed, replace console.log with a spy. The spy records the calls and prints nothing.
describe("createLogger", () => {
  let consoleLog: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  test("prints info messages with an [info] label", () => {
    createLogger("info").info("shop is open");

    expect(consoleLog).toHaveBeenCalledExactlyOnceWith("[info] shop is open");
  });

  test("hides debug messages at the info level", () => {
    createLogger("info").debug("checking stock");

    expect(consoleLog).not.toHaveBeenCalled();
  });

  test("prints debug messages at the debug level", () => {
    createLogger("debug").debug("checking stock");

    expect(consoleLog).toHaveBeenCalledExactlyOnceWith("[debug] checking stock");
  });
});
