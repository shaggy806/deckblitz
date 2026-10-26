import { defineCard } from "../define.js";

// EDHREC rank 14800.

const TEXT =
  "At the beginning of each player's upkeep, this enchantment deals damage to that player equal to the number of artifacts they control.";

export default defineCard({
  name: "Ancient Runes",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "artifact", controlledBy: "active-player" } },
        who: "active-player",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
