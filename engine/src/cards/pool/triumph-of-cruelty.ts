import { defineCard } from "../define.js";

// EDHREC rank 25185.
//
// Rulings:
//   [2012-05-01] The ability triggers at each of your upkeeps regardless of who controls the
//     creature with the greatest power; whether the opponent discards is checked on resolution.

const TEXT =
  "At the beginning of your upkeep, target opponent discards a card if you control the creature with the greatest power or tied for the greatest power.";

export default defineCard({
  name: "Triumph of Cruelty",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "conditional",
        condition: { kind: "controls-greatest", of: "power", filter: { type: "creature" } },
        then: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
