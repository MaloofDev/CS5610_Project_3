// Seeded random numbers (mulberry32) so every seed run produces the same data.
let state = 5610;

export function random() {
  state = (state + 0x6d2b79f5) | 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const pick = (array) => array[Math.floor(random() * array.length)];

// Integer between min and max, inclusive.
export const int = (min, max) => min + Math.floor(random() * (max - min + 1));

export const chance = (p) => random() < p;

export const hex = (n) =>
  Array.from({ length: n }, () => Math.floor(random() * 16).toString(16)).join(
    "",
  );
