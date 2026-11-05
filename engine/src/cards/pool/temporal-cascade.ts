import { defineCard } from "../define.js";

// EDHREC rank 17427.

export default defineCard({
  name: "Temporal Cascade",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Each player shuffles their hand and graveyard into their library.\n• Each player draws seven cards.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Each player shuffles their hand and graveyard into their library.",
        effect: {
          kind: "shuffle-graveyard-into-library",
          target: "each-player",
          zones: ["hand", "graveyard"],
        },
      },
      {
        text: "Each player draws seven cards.",
        effect: { kind: "draw", amount: 7, who: "each-player" },
      },
    ],
    kickedModes: 2,
  },
});
