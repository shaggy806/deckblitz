import { defineCard } from "../define.js";

export default defineCard({
  name: "Pir's Whim",
  manaCost: "{3}{G}",
  types: ["sorcery"],
  text:
    "For each player, choose friend or foe. Each friend searches their library for a land card, puts it onto the battlefield tapped, then shuffles. Each foe sacrifices an artifact or enchantment of their choice.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "you", for: { options: ["friend", "foe"], about: "each-player" } },
      {
        kind: "for-each-player",
        who: "each-friend",
        effect: {
          kind: "search-library",
          who: "that-player",
          filter: { type: "land" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: 1,
        },
      },
      { kind: "sacrifice", who: "each-foe", filter: { typesAnyOf: ["artifact", "enchantment"] }, count: 1 },
    ],
  },
});
