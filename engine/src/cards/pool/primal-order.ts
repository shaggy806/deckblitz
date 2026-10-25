import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 15976. Cold Snap's shape, counting nonbasic lands.

const TEXT =
  "At the beginning of each player's upkeep, this enchantment deals damage to that player equal to the number of nonbasic lands they control.";

export default defineCard({
  name: "Primal Order",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "land", notSupertype: "basic", controlledBy: "active-player" } },
        who: "active-player",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
