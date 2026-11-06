// The CPR metronome's beat (D-067), pure for tests. 110 compressions a minute, the middle of the
// 100–120 in Førstehjælpens ABC (p. 28) and ERC 2025; 30 compressions, then 2 rescue breaths.

export const CPR_RATE = 110;
export const COMPRESSIONS = 30;
export const beatMs = (rate = CPR_RATE) => 60_000 / rate;

// Where a round of 30 is after `elapsedMs` (beat 1 sounds at 0 ms): the compression to count now,
// how far into its beat we are (0–1, for the pulse), and whether the 30 are done.
export function roundState(elapsedMs: number, rate = CPR_RATE): { count: number; phase: number; breaths: boolean } {
  const ms = beatMs(rate);
  const t = Math.max(0, elapsedMs);
  const beat = Math.floor(t / ms);
  if (beat >= COMPRESSIONS) return { count: COMPRESSIONS, phase: 1, breaths: true };
  return { count: beat + 1, phase: (t % ms) / ms, breaths: false };
}
