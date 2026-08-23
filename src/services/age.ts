// The ML model was only trained on 5 age brackets (25-30 .. 45-50), but the
// app now collects a real age (17-90) at registration for a nicer UX. Any
// age outside the trained range is clamped to the nearest bracket rather
// than rejected -- this is a known research-prototype approximation, not a
// precise clinical mapping.
export function ageToBracket(age: number, brackets: string[]): string {
  let best = brackets[0];
  let bestDist = Infinity;
  for (const b of brackets) {
    const [lo, hi] = b.split('-').map(Number);
    const dist = age < lo ? lo - age : age > hi ? age - hi : 0;
    if (dist < bestDist) {
      bestDist = dist;
      best = b;
    }
  }
  return best;
}

export const MIN_AGE = 17;
export const MAX_AGE = 90;

export function parseAge(input: string): number | null {
  const n = Number(input.trim());
  if (!Number.isInteger(n) || n < MIN_AGE || n > MAX_AGE) return null;
  return n;
}

// Accounts created before the typed-age feature may still have a raw bracket
// ("25-30") on file instead of a number -- accept either form and resolve to
// a bracket the server's /predict endpoint will take, or null if unusable.
export function storedAgeToBracket(stored: string | null | undefined, brackets: string[]): string | null {
  if (!stored) return null;
  if (brackets.includes(stored)) return stored;
  const age = parseAge(stored);
  return age == null ? null : ageToBracket(age, brackets);
}
