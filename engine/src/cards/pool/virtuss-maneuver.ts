import { defineCard } from "../define.js";

export default defineCard({
  name: "Virtus's Maneuver",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "For each player, choose friend or foe. Each friend returns a creature card from their graveyard to their hand. Each foe sacrifices a creature of their choice.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "you", for: { options: ["friend", "foe"], about: "each-player" } },
      {
        kind: "for-each-player",
        who: "each-friend",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          filter: { type: "creature" },
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
        },
      },
      { kind: "sacrifice", who: "each-foe", filter: { type: "creature" }, count: 1 },
    ],
  },
});
