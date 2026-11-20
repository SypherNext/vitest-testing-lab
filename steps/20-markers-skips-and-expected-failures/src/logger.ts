import type { LogLevel } from "./config.ts";

export interface Logger {
  info(message: string): void;
  debug(message: string): void;
}

// A very small logger that prints to the console.
// "info" messages always print. "debug" messages print only when the level is "debug".
export function createLogger(level: LogLevel): Logger {
  return {
    info: (message) => console.log(`[info] ${message}`),
    debug: (message) => {
      if (level === "debug") {
        console.log(`[debug] ${message}`);
      }
    },
  };
}
