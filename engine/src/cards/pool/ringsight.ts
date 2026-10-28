import type { EffectSpec } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

const TEXT =
  "The Ring tempts you. Search your library for a card that shares a color with a legendary creature you control, reveal it, put it into your hand, then shuffle.";

const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

/**
 * "A card that shares a color with a legendary creature you control", read
 * after the Ring has tempted you (the Ring-bearer is legendary — the
 * rulings): for each colour in turn, whether you control a legendary
 * creature of it, and at the end a search for a card of any colour found. A
 * colourless legendary creature adds no colour, so with none found the
 * search can find nothing (the rulings) — it's still a search, and the
 * library is still shuffled.
 */
function byColors(index: number, found: readonly Color[]): EffectSpec {
  if (index === COLORS.length) {
    if (found.length === 0) return { kind: "shuffle-library" };
    return {
      kind: "search-library",
      filter: { anyOf: found.map((color) => ({ colors: [color] })) },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
    };
  }
  const color = COLORS[index];
  return {
    kind: "conditional",
    condition: {
      kind: "controls",
      filter: { type: "creature", supertype: "legendary", colors: [color] },
      atLeast: 1,
    },
    then: byColors(index + 1, [...found, color]),
    else: byColors(index + 1, found),
  };
}

export default defineCard({
  name: "Ringsight",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: { kind: "sequence", effects: [{ kind: "the-ring-tempts-you" }, byColors(0, [])] },
});
