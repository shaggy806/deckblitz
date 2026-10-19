import { defineCard } from "../define.js";

// Domain: the ability costs {1} less for each basic land type among lands you
// control — {5} down to {0} with all five.

const TEXT =
  "Domain — {5}, {T}: Draw a card. This ability costs {1} less to activate for each basic land type among lands you control.";

export default defineCard({
  name: "Jodah's Codex",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
      costReduction: { reduceGeneric: { basicLandTypes: "you" } },
    },
  ],
});
