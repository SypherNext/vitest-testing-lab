// A moment in time as text, in UTC, with whole seconds: 2026-03-14T09:30:00Z.
// Files and JSON answers use this one format everywhere, so we write the rule in one place.
export function toIsoSeconds(moment: Date): string {
  return `${moment.toISOString().slice(0, 19)}Z`;
}
