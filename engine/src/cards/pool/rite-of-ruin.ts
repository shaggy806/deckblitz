import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";
import type { ModeOption } from "../../effects.js";

// "Choose an order for artifacts, creatures, and lands" — chosen as the spell
// resolves (the ruling), so a resolution-time modal of the six orders. Each
// step is its own `sacrifice`: every player in turn order chooses, then those
// permanents are sacrificed at once, before the next type (the rulings).
const TYPES: readonly { readonly word: string; readonly filter: CardFilter }[] = [
  { word: "artifacts", filter: { type: "artifact" } },
  { word: "creatures", filter: { type: "creature" } },
  { word: "lands", filter: { type: "land" } },
];

const ORDERS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

const MODES: readonly ModeOption[] = ORDERS.map((order) => ({
  text: `First ${TYPES[order[0]].word}, then ${TYPES[order[1]].word}, then ${TYPES[order[2]].word}.`,
  effect: {
    kind: "sequence",
    effects: order.map((type, i) => ({
      kind: "sacrifice" as const,
      who: "each-player" as const,
      filter: TYPES[type].filter,
      count: i + 1,
    })),
  },
}));

export default defineCard({
  name: "Rite of Ruin",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose an order for artifacts, creatures, and lands. Each player sacrifices one permanent of their choice of the first type, sacrifices two of their choice of the second type, then sacrifices three of their choice of the third type.",
  effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
});
