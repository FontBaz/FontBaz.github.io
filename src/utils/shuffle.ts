// Random per reload; stable within a session so cached and fetched data keep the same order.

/* eslint-disable no-bitwise -- bitwise ops are the whole point of a string hash */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;

  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
/* eslint-enable no-bitwise */

let sessionSeed: string | null = null;

function getSessionSeed(): string {
  if (sessionSeed === null) {
    const bytes = new Uint32Array(1);

    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
      crypto.getRandomValues(bytes);
      sessionSeed = String(bytes[0]);
    } else {
      sessionSeed = String(Math.floor(Math.random() * 0xffffffff));
    }
  }

  return sessionSeed;
}

/**
 * Deterministic per-session shuffle: order depends only on the session seed
 * and each item's key, not on the input array order.
 */
export function shuffleByKey<T>(
  items: readonly T[],
  keyOf: (item: T) => string
): T[] {
  const seed = getSessionSeed();

  return items
    .map(item => {
      const hash = xmur3(`${seed}:${keyOf(item)}`)();
      return { item, hash };
    })
    .sort((a, b) => a.hash - b.hash)
    .map(entry => entry.item);
}

export function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
