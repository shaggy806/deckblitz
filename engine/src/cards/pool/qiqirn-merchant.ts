import { defineCard } from "../define.js";

// EDHREC rank 16049.
//
// Waterbending Scroll's "costs {1} less to activate for each [permanent] you
// control", over Towns.

const LOOT_TEXT = "{1}, {T}: Draw a card, then discard a card.";
const DRAW_TEXT =
  "{7}, {T}, Sacrifice this creature: Draw three cards. This ability costs {1} less to activate for each Town you control.";

export default defineCard({
  name: "Qiqirn Merchant",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast", "Citizen"],
  power: 1,
  toughness: 4,
  text: `${LOOT_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      cost: { mana: "{7}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      costReduction: { reduceGeneric: { countOf: { subtype: "Town", controlledBy: "you" } } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
