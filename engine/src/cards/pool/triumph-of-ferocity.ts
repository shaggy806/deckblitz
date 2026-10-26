import { defineCard } from "../define.js";

// Rulings:
//   [2012-05-01] Triumph of Ferocity's ability will trigger at the beginning of each of your
//     upkeeps regardless of who controls the creature with the greatest power. The ability checks
//     whether you'll draw a card when it resolves.

export default defineCard({
  name: "Triumph of Ferocity",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, draw a card if you control the creature with the greatest power or tied for the greatest power.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls-greatest", of: "power", filter: { type: "creature" } },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, draw a card if you control the creature with the greatest power or tied for the greatest power.",
    },
  ],
});
