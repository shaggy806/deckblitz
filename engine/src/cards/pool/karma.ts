import { defineCard } from "../define.js";

// EDHREC rank 19285.
//
// Rulings:
//   [2004-10-04] Amount of damage is determined when the ability resolves and not when it is
//     placed on the stack.

const TEXT =
  "At the beginning of each player's upkeep, this enchantment deals damage to that player equal to the number of Swamps they control.";

export default defineCard({
  name: "Karma",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countOf: { subtype: "Swamp", controlledBy: "active-player" } },
        who: "active-player",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
