import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 11260.
//
// The upkeep player reveals their top card and, if it's an artifact, creature,
// enchantment or land card, chooses whether to put it onto the battlefield
// (under their own control); otherwise it stays on top.

const TEXT =
  "At the beginning of each player's upkeep, that player reveals the top card of their library. If it's an artifact, creature, enchantment, or land card, the player may put it onto the battlefield.";

export default defineCard({
  name: "Gate to the Aether",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "active-player",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "library",
          count: 1,
          reveal: true,
          min: 0,
          max: 1,
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
