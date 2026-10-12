import { defineCard } from "../define.js";

// EDHREC rank 8120.

const MANA_TEXT = "{4}, {T}: Add four mana in any combination of colors.";
const DRAW_TEXT = "{4}, {T}: Draw a card. Activate only if you control a creature with toughness 4 or greater.";

export default defineCard({
  name: "Baxter Building",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${MANA_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 4 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      // Bonders' Enclave's shape, on toughness.
      condition: { kind: "controls", filter: { type: "creature", toughness: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
