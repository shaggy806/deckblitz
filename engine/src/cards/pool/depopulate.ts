import { defineCard } from "../define.js";

// Who draws is fixed as it begins — each player who controls a multicolored
// creature then — and the creatures are destroyed after.

const TEXT = "Each player who controls a multicolored creature draws a card. Then destroy all creatures.";

export default defineCard({
  name: "Depopulate",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "controls", filter: { type: "creature", multicolored: true }, atLeast: 1 },
        },
        effect: { kind: "draw", amount: 1, who: "that-player" },
      },
      { kind: "destroy-all", filter: { type: "creature" } },
    ],
  },
});
