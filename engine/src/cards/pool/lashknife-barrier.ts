import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 26416.

const REDUCE =
  "If a source would deal damage to a creature you control, it deals that much damage minus 1 to that creature instead.";

export default defineCard({
  name: "Lashknife Barrier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `When this enchantment enters, draw a card.\n${REDUCE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this enchantment enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: -1,
        toFilter: { type: "creature", controlledBy: "you" },
      },
      text: REDUCE,
    },
  ],
});
