import type { Clock } from "./ports.ts";

// The real clock: it reads the time from the computer every time it is asked.
export const systemClock: Clock = {
  now: () => new Date(),
};
