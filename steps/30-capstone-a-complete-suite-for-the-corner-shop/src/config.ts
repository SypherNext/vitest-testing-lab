import { ConfigError } from "./errors.ts";

export const LOG_LEVELS = ["info", "debug"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface ShopConfig {
  shopName: string;
  taxRegion: string;
  logLevel: LogLevel;
}

type Environment = Record<string, string | undefined>;

const DEFAULT_SHOP_NAME = "Corner Shop";
const DEFAULT_LOG_LEVEL: LogLevel = "info";

// Reads the shop's settings from environment variables (settings that live outside the code).
//   SHOP_NAME       optional, defaults to "Corner Shop"
//   SHOP_TAX_REGION required, for example "US-CA"
//   SHOP_LOG_LEVEL  optional, "info" (default) or "debug"
// By default it reads the real environment. A test can pass a plain object instead.
export function loadConfig(env: Environment = process.env): ShopConfig {
  const taxRegion = readSetting(env, "SHOP_TAX_REGION");
  if (taxRegion === undefined) {
    throw new ConfigError("SHOP_TAX_REGION is not set");
  }

  return {
    shopName: readSetting(env, "SHOP_NAME") ?? DEFAULT_SHOP_NAME,
    taxRegion,
    logLevel: readLogLevel(env),
  };
}

// A setting that is missing, empty or only spaces counts as "not set".
function readSetting(env: Environment, name: string): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

function readLogLevel(env: Environment): LogLevel {
  const value = readSetting(env, "SHOP_LOG_LEVEL");
  if (value === undefined) {
    return DEFAULT_LOG_LEVEL;
  }
  const level = LOG_LEVELS.find((allowed) => allowed === value);
  if (!level) {
    throw new ConfigError(`SHOP_LOG_LEVEL must be "info" or "debug", not "${value}"`);
  }
  return level;
}
