import { afterEach, describe, expect, test, vi } from "vitest";
import { loadConfig } from "../src/config.ts";
import { ConfigError } from "../src/errors.ts";

afterEach(() => {
  // Puts every environment variable back the way it was before the test changed it.
  vi.unstubAllEnvs();
});

describe("loadConfig with the real environment", () => {
  // vi.stubEnv sets an environment variable for one test. unstubAllEnvs (above) undoes it.
  test("reads the settings from environment variables", () => {
    vi.stubEnv("SHOP_TAX_REGION", "US-CA");
    vi.stubEnv("SHOP_NAME", "Corner Shop West");
    vi.stubEnv("SHOP_LOG_LEVEL", "debug");

    expect(loadConfig()).toEqual({ shopName: "Corner Shop West", taxRegion: "US-CA", logLevel: "debug" });
  });

  test("uses the defaults for the optional settings", () => {
    vi.stubEnv("SHOP_TAX_REGION", "US-CA");
    vi.stubEnv("SHOP_NAME", undefined); // undefined removes the variable for this test
    vi.stubEnv("SHOP_LOG_LEVEL", undefined);

    expect(loadConfig()).toEqual({ shopName: "Corner Shop", taxRegion: "US-CA", logLevel: "info" });
  });

  test("throws ConfigError when the tax region is not set", () => {
    vi.stubEnv("SHOP_TAX_REGION", undefined);

    expect(() => loadConfig()).toThrow(ConfigError);
    expect(() => loadConfig()).toThrow("SHOP_TAX_REGION is not set");
  });
});

// The simpler way: loadConfig takes the settings as an argument, so a plain object is enough.
describe("loadConfig with a plain object", () => {
  test("counts a blank setting as not set", () => {
    expect(() => loadConfig({ SHOP_TAX_REGION: "   " })).toThrow("SHOP_TAX_REGION is not set");
  });

  test("ignores spaces around a value", () => {
    const config = loadConfig({ SHOP_TAX_REGION: " US-NY ", SHOP_LOG_LEVEL: " debug " });

    expect(config.taxRegion).toBe("US-NY");
    expect(config.logLevel).toBe("debug");
  });

  test.each(["verbose", "INFO", "warn"])("rejects the log level '%s'", (logLevel) => {
    expect(() => loadConfig({ SHOP_TAX_REGION: "US-CA", SHOP_LOG_LEVEL: logLevel })).toThrow(
      `SHOP_LOG_LEVEL must be "info" or "debug", not "${logLevel}"`,
    );
  });
});
