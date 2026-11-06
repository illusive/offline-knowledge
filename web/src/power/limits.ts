// How long the fridge and freezer keep food cold without power (D-058). The hours are from USDA
// FSIS, "Keeping Food Safe During an Emergency", checked against CDC, "Keep Food Safe After a
// Disaster or Emergency" (both in the content pack's sources); the same advice, translated, is in
// the guide "Strømmen er gået". Pure, so the tests need no browser.

export const LIMITS = [
  { id: 'fridge', hours: 4 },
  { id: 'freezerFull', hours: 48 },
  { id: 'freezerHalf', hours: 24 },
] as const;

export type LimitId = (typeof LIMITS)[number]['id'];

// Minutes since the power went (never negative, for a start time set in the future by mistake).
export const minutesSince = (startedAt: number, now: number) => Math.max(0, (now - startedAt) / 60_000);

// Minutes left before a place passes its limit, or 0 when it has.
export const minutesLeft = (hours: number, elapsedMinutes: number) => Math.max(0, hours * 60 - elapsedMinutes);
